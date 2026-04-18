<?php
declare(strict_types=1);

final class TranslationRepository extends BaseRepository
{
    public function translateTexts(array $texts, string $sourceLang = 'ru', string $targetLang = 'en'): array
    {
        $sourceLang = api_normalize_string($sourceLang) ?: 'ru';
        $targetLang = api_normalize_string($targetLang) ?: 'en';
        $translationEnabled = api_parse_boolean(get_env('TRANSLATION_ENABLED', 'true'), true);

        if (!$translationEnabled || $sourceLang === $targetLang) {
            $translations = [];
            foreach (api_ensure_array($texts) as $text) {
                $normalized = api_normalize_translation_text($text);
                if ($normalized === '') {
                    continue;
                }
                $translations[$normalized] = $normalized;
            }
            return $translations;
        }

        $normalizedTexts = array_values(array_unique(array_filter(array_map(
            static fn(mixed $text): string => api_normalize_translation_text($text),
            api_ensure_array($texts)
        ), static fn(string $text): bool => $text !== '' && api_contains_cyrillic($text))));

        if (!$normalizedTexts) {
            return [];
        }

        $cached = $this->getCachedTranslations($sourceLang, $targetLang, $normalizedTexts);
        $missing = array_values(array_filter($normalizedTexts, static fn(string $text): bool => !array_key_exists($text, $cached)));
        if (!$missing) {
            return $cached;
        }

        $translated = [];
        foreach ($missing as $text) {
            $translated[$text] = $this->translateText($text, $sourceLang, $targetLang);
        }

        $this->saveTranslations($sourceLang, $targetLang, $translated);
        return array_merge($cached, $translated);
    }

    private function getCachedTranslations(string $sourceLang, string $targetLang, array $texts): array
    {
        $texts = array_values(array_filter(array_map('api_normalize_translation_text', $texts), static fn(string $text): bool => $text !== ''));
        if (!$texts) {
            return [];
        }

        $placeholders = api_sql_in_placeholders($texts);
        $rows = api_query_rows($this->pdo, "
            SELECT source_text, translated_text
            FROM content_translations
            WHERE source_lang = ?
              AND target_lang = ?
              AND source_text IN ($placeholders)
        ", array_merge([$sourceLang, $targetLang], $texts));

        $translations = [];
        foreach ($rows as $row) {
            $sourceText = api_normalize_translation_text($row['source_text'] ?? '');
            $translatedText = api_normalize_translation_text($row['translated_text'] ?? '');
            if ($sourceText === '' || $translatedText === '') {
                continue;
            }
            $translations[$sourceText] = $translatedText;
        }

        return $translations;
    }

    private function saveTranslations(string $sourceLang, string $targetLang, array $translations): void
    {
        $provider = api_normalize_string(get_env('TRANSLATION_PROVIDER', 'google-gtx')) ?: 'google-gtx';
        foreach ($translations as $sourceText => $translatedText) {
            $sourceText = api_normalize_translation_text($sourceText);
            $translatedText = api_normalize_translation_text($translatedText);
            if ($sourceText === '' || $translatedText === '') {
                continue;
            }

            api_execute($this->pdo, '
                INSERT INTO content_translations (
                    source_lang, target_lang, source_text, translated_text, provider
                )
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    translated_text = VALUES(translated_text),
                    provider = VALUES(provider),
                    updated_at = CURRENT_TIMESTAMP
            ', [$sourceLang, $targetLang, $sourceText, $translatedText, $provider]);
        }
    }

    private function translateText(string $text, string $sourceLang, string $targetLang): string
    {
        $provider = api_normalize_string(get_env('TRANSLATION_PROVIDER', 'google-gtx')) ?: 'google-gtx';
        if ($provider !== 'google-gtx') {
            throw new RuntimeException('Unsupported translation provider: ' . $provider);
        }

        $controller = null;
        $timeout = 10;
        $response = null;

        $url = 'https://translate.googleapis.com/translate_a/single?' . http_build_query([
            'client' => 'gtx',
            'sl' => $sourceLang,
            'tl' => $targetLang,
            'dt' => 't',
            'q' => $text,
        ]);

        if (function_exists('curl_init')) {
            $controller = curl_init($url);
            if ($controller === false) {
                throw new RuntimeException('Unable to initialize translation request');
            }
            curl_setopt_array($controller, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => $timeout,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_HTTPHEADER => ['User-Agent: BurchalkinCupTranslate/1.0'],
            ]);
            $response = curl_exec($controller);
            if ($response === false) {
                $error = curl_error($controller) ?: 'Translation request failed';
                curl_close($controller);
                throw new RuntimeException($error);
            }
            $status = (int) curl_getinfo($controller, CURLINFO_HTTP_CODE);
            curl_close($controller);
            if ($status < 200 || $status >= 300) {
                throw new RuntimeException('Translation request failed with status ' . $status);
            }
        } else {
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "User-Agent: BurchalkinCupTranslate/1.0\r\n",
                    'timeout' => $timeout,
                ],
            ]);
            $response = @file_get_contents($url, false, $context);
            if ($response === false) {
                throw new RuntimeException('Translation request failed');
            }
            if (!empty($http_response_header) && is_array($http_response_header)) {
                $statusLine = $http_response_header[0] ?? '';
                if (preg_match('/\s(\d{3})\s/', (string) $statusLine, $match) === 1) {
                    $status = (int) $match[1];
                    if ($status < 200 || $status >= 300) {
                        throw new RuntimeException('Translation request failed with status ' . $status);
                    }
                }
            }
        }

        $payload = json_decode((string) $response, true);
        $translatedText = '';
        if (is_array($payload) && isset($payload[0]) && is_array($payload[0])) {
            $parts = [];
            foreach ($payload[0] as $item) {
                if (is_array($item) && isset($item[0])) {
                    $parts[] = (string) $item[0];
                }
            }
            $translatedText = trim(implode('', $parts));
        }

        return $translatedText !== '' ? $translatedText : $text;
    }
}
