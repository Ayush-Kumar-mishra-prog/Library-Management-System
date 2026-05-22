<?php

namespace App\Controllers;

use Core\Auth;
use Core\Request;
use mysqli;

abstract class BaseController
{
    public function __construct(
        protected mysqli $conn,
        protected Request $request,
        protected Auth $auth
    ) {
    }

    protected function createNotification(
        int $recipientId,
        ?int $senderId,
        string $senderRole,
        string $title,
        string $message,
        string $type = 'general',
        ?int $relatedId = null,
        bool $seen = false
    ): void {
        $stmt = $this->conn->prepare('INSERT INTO notifications (recipient_id, sender_id, sender_role, title, message, type, related_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $seenInt = $seen ? 1 : 0;
        $stmt->bind_param('iisssii', $recipientId, $senderId, $senderRole, $title, $message, $type, $relatedId, $seenInt);
        $stmt->execute();
    }
}
?>
