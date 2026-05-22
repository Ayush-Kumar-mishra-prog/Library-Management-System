<?php

namespace Core;

use mysqli;

class Auth
{
    public function user(): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!$header) {
            $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        }
        if (!$header && function_exists('getallheaders')) {
            $headers = getallheaders();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (!preg_match('/Bearer\s+(.+)$/i', $header, $matches)) {
            return null;
        }
        return \verify_jwt($matches[1]);
    }

    /** @param list<string> $roles */
    public function requireRole(array $roles): array
    {
        $user = $this->user();
        if (!$user || !in_array($user['role'], $roles, true)) {
            Response::json(['error' => 'Unauthorized'], 401);
        }
        return $user;
    }
}
?>