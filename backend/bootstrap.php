<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (str_starts_with($class, $prefix)) {
        $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
        $file = __DIR__ . '/app/' . $relative . '.php';
        if (is_file($file)) {
            require_once $file;
        }
    }
    $corePrefix = 'Core\\';
    if (str_starts_with($class, $corePrefix)) {
        $relative = str_replace('\\', '/', substr($class, strlen($corePrefix)));
        $file = __DIR__ . '/core/' . $relative . '.php';
        if (is_file($file)) {
            require_once $file;
        }
    }
});
?>