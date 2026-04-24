<?php
declare(strict_types=1);

date_default_timezone_set('Europe/Moscow');

load_local_config();

function load_local_config(): void
{
    $configFile = __DIR__ . '/../config.local.php';
    if (!is_file($configFile)) {
        return;
    }

    $config = require $configFile;
    if (!is_array($config)) {
        return;
    }

    foreach ($config as $key => $value) {
        if (!is_string($key) || $key === '') {
            continue;
        }

        if (array_key_exists($key, $_ENV) || array_key_exists($key, $_SERVER) || getenv($key) !== false) {
            continue;
        }

        set_env_value($key, (string) $value);
    }
}

function set_env_value(string $key, string $value): void
{
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
    putenv($key . '=' . $value);
}

function get_env(string $key, string $default = ''): string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null) {
        return $default;
    }
    $value = trim((string) $value);
    return $value === '' ? $default : $value;
}
