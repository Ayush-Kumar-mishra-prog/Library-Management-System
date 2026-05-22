<?php

function get_db_connection(): mysqli
{
    static $conn = null;
    if ($conn !== null) {
        return $conn;
    }

    $config = require __DIR__ . '/config.php';
    $db = $config['db'];

    $conn = new mysqli($db['host'], $db['username'], $db['password'], $db['database']);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}
?>