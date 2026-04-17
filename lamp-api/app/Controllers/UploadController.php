<?php
declare(strict_types=1);

final class UploadController
{
    private string $uploadRoot;

    public function __construct()
    {
        $this->uploadRoot = dirname(__DIR__, 2) . '/public/uploads';
    }

    public function uploadImage(array $body): array
    {
        return $this->uploadBinary($body, 'image');
    }

    public function uploadVideo(array $body): array
    {
        return $this->uploadBinary($body, 'video');
    }

    public function uploadRaw(array $body): array
    {
        return $this->uploadBinary($body, 'raw');
    }

    private function uploadBinary(array $body, string $kind): array
    {
        $dataUrl = api_normalize_string($body['file'] ?? '');
        if ($dataUrl === '') {
            throw new RuntimeException('File payload is missing');
        }

        [$mimeType, $bytes] = $this->decodeDataUrl($dataUrl);
        if ($bytes === '') {
            throw new RuntimeException('Unable to decode uploaded file');
        }

        $folder = $this->sanitizePath(api_normalize_string($body['folder'] ?? 'uploads'));
        $filenameBase = $this->sanitizeFileBase(
            api_normalize_string($body['filename'] ?? '')
            ?: api_normalize_string($body['original_filename'] ?? '')
            ?: $kind . '-' . date('Ymd-His')
        );
        $extension = $this->guessExtension($mimeType, $kind, api_normalize_string($body['original_filename'] ?? ''));

        $relativeFolder = trim($folder, '/');
        $relativePath = $relativeFolder !== '' ? $relativeFolder . '/' : '';
        $relativeFile = $relativePath . $filenameBase . $extension;
        $absoluteFile = $this->uploadRoot . '/' . $relativeFile;

        $this->ensureDirectory(dirname($absoluteFile));
        file_put_contents($absoluteFile, $bytes);

        $metadata = [
            'url' => '/uploads/' . $relativeFile,
            'storage_provider' => 'local',
            'public_id' => trim(str_replace('/', '-', $relativePath . $filenameBase), '-'),
            'file_name' => basename($relativeFile),
            'mime_type' => $mimeType,
            'format' => ltrim($extension, '.'),
            'width' => null,
            'height' => null,
            'bytes' => strlen($bytes),
        ];

        if ($kind === 'image' && function_exists('getimagesizefromstring')) {
            $size = @getimagesizefromstring($bytes);
            if (is_array($size)) {
                $metadata['width'] = isset($size[0]) ? (int) $size[0] : null;
                $metadata['height'] = isset($size[1]) ? (int) $size[1] : null;
                $metadata['format'] = isset($size['mime']) ? $this->guessFormatFromMime((string) $size['mime']) : $metadata['format'];
                $metadata['mime_type'] = isset($size['mime']) ? (string) $size['mime'] : $metadata['mime_type'];
            }
        }

        return $metadata;
    }

    private function decodeDataUrl(string $dataUrl): array
    {
        if (preg_match('#^data:([^;]+);base64,(.+)$#', $dataUrl, $matches) !== 1) {
            throw new RuntimeException('Invalid data URL');
        }

        $mimeType = trim((string) $matches[1]);
        $bytes = base64_decode((string) $matches[2], true);
        if ($bytes === false) {
            throw new RuntimeException('Invalid base64 payload');
        }

        return [$mimeType, $bytes];
    }

    private function sanitizePath(string $path): string
    {
        $segments = array_values(array_filter(array_map(function (string $segment): string {
            $segment = strtolower(trim($segment));
            $segment = preg_replace('/[^a-z0-9а-яё_-]+/iu', '-', $segment) ?: '';
            $segment = trim($segment, '-');
            return $segment;
        }, preg_split('#[\\\\/]+#', $path) ?: []), static fn(string $segment): bool => $segment !== ''));

        return $segments ? implode('/', $segments) : 'uploads';
    }

    private function sanitizeFileBase(string $name): string
    {
        $name = strtolower(trim($name));
        $name = preg_replace('/\.[^.]+$/', '', $name) ?: $name;
        $name = preg_replace('/[^a-z0-9а-яё_-]+/iu', '-', $name) ?: '';
        $name = trim($name, '-');
        return $name !== '' ? $name : 'file-' . date('Ymd-His');
    }

    private function guessExtension(string $mimeType, string $kind, string $originalFilename): string
    {
        $mimeType = strtolower(trim($mimeType));
        $map = [
            'image/jpeg' => '.jpg',
            'image/jpg' => '.jpg',
            'image/png' => '.png',
            'image/gif' => '.gif',
            'image/webp' => '.webp',
            'image/avif' => '.avif',
            'image/bmp' => '.bmp',
            'image/svg+xml' => '.svg',
            'video/mp4' => '.mp4',
            'video/webm' => '.webm',
            'video/quicktime' => '.mov',
            'video/x-matroska' => '.mkv',
            'application/pdf' => '.pdf',
        ];

        if (isset($map[$mimeType])) {
            return $map[$mimeType];
        }

        $originalExtension = strtolower(pathinfo($originalFilename, PATHINFO_EXTENSION));
        if ($originalExtension !== '') {
            $originalExtension = preg_replace('/[^a-z0-9]+/i', '', $originalExtension) ?: '';
            if ($originalExtension !== '') {
                return '.' . $originalExtension;
            }
        }

        return $kind === 'image' ? '.jpg' : ($kind === 'video' ? '.mp4' : '.bin');
    }

    private function guessFormatFromMime(string $mimeType): string
    {
        return match (strtolower(trim($mimeType))) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/avif' => 'avif',
            'image/bmp' => 'bmp',
            'image/svg+xml' => 'svg',
            default => '',
        };
    }

    private function ensureDirectory(string $directory): void
    {
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to create upload directory');
        }
    }
}
