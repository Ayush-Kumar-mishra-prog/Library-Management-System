<?php

namespace Core;

class Response
{
    public static function json(array $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
}
?>