<?php

namespace Core;

class Request
{
    public function method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public function path(): string
    {
        $path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
        $apiPos = strpos($path, 'backend/index.php');
        if ($apiPos !== false) {
            $path = trim(substr($path, $apiPos + strlen('backend/index.php')), '/');
        }
        return $path;
    }

    public function body(): array
    {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
?>