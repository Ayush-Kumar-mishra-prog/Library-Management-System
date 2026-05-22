<?php

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    $remainder = strlen($data) % 4;
    if ($remainder > 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function create_jwt(array $payload): string
{
    $config = require __DIR__ . '/config.php';
    $secret = $config['jwt_secret'];
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $segments = [
        base64url_encode(json_encode($header)),
        base64url_encode(json_encode($payload))
    ];
    $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
    $segments[] = base64url_encode($signature);
    return implode('.', $segments);
}

function verify_jwt(string $token): ?array
{
    $config = require __DIR__ . '/config.php';
    $secret = $config['jwt_secret'];
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$headerB64, $payloadB64, $signatureB64] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', $headerB64 . '.' . $payloadB64, $secret, true));
    if (!hash_equals($expected, $signatureB64)) {
        return null;
    }

    $payload = json_decode(base64url_decode($payloadB64), true);
    if (!$payload || !isset($payload['exp']) || time() >= (int)$payload['exp']) {
        return null;
    }
    return $payload;
}

?>
