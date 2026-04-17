<?php
declare(strict_types=1);

date_default_timezone_set('Europe/Moscow');

function get_env(string $key, string $default = ''): string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null) {
        return $default;
    }
    $value = trim((string) $value);
    return $value === '' ? $default : $value;
}

