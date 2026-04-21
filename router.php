<?php

$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
$documentRoot = __DIR__;

if (str_starts_with($path, '/uploads/')) {
    $uploadTarget = $documentRoot . '/lamp-api/public' . $path;
    if (is_file($uploadTarget)) {
        $mimeType = mime_content_type($uploadTarget) ?: 'application/octet-stream';
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . (string) filesize($uploadTarget));
        readfile($uploadTarget);
        return true;
    }
}

if ($path === '/api' || str_starts_with($path, '/api/')) {
    require $documentRoot . '/lamp-api/public/api/index.php';
    return true;
}

if ($path === '/') {
    header('Content-Type: text/html; charset=UTF-8');
    readfile($documentRoot . '/index.html');
    return true;
}

$target = $documentRoot . $path;

if (is_file($target) || is_link($target)) {
    return false;
}

if (is_dir($target)) {
    return false;
}

http_response_code(404);
header('Content-Type: text/plain; charset=UTF-8');
echo 'Not Found';
return true;
