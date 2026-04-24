<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

echo "PHP OK\n";
echo "FILE: " . __FILE__ . "\n";
echo "CONFIG_PATH: " . __DIR__ . '/config.local.php' . "\n";
echo "CONFIG_EXISTS: " . (is_file(__DIR__ . '/config.local.php') ? 'yes' : 'no') . "\n";
echo "CONFIG_READABLE: " . (is_readable(__DIR__ . '/config.local.php') ? 'yes' : 'no') . "\n";
echo "\n";

if (is_file(__DIR__ . '/config.local.php')) {
    $rawConfig = require __DIR__ . '/config.local.php';
    echo "CONFIG_RETURN_TYPE: " . gettype($rawConfig) . "\n";
    if (is_array($rawConfig)) {
        echo "CONFIG_KEYS: " . implode(', ', array_keys($rawConfig)) . "\n";
    } else {
        echo "CONFIG_VALUE: " . var_export($rawConfig, true) . "\n";
    }
}

echo "\n";

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/Database.php';

echo "DB_HOST=" . get_env('DB_HOST') . "\n";
echo "DB_PORT=" . get_env('DB_PORT') . "\n";
echo "DB_NAME=" . get_env('DB_NAME') . "\n";
echo "DB_USER=" . get_env('DB_USER') . "\n";
echo "ADMIN_TOKEN=" . (get_env('ADMIN_TOKEN') !== '' ? 'yes' : 'no') . "\n";
echo "\n";

try {
    $pdo = Database::pdo();
    echo "PDO: connected\n";
    echo "Server version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
