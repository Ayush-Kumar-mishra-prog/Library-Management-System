<?php

namespace App\Controllers;

use Core\Auth;
use Core\Request;
use Core\Response;
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
        $stmt->bind_param('iissssii', $recipientId, $senderId, $senderRole, $title, $message, $type, $relatedId, $seenInt);
        $stmt->execute();
    }

    protected function listNotificationsForRole(string $role): void
    {
        $user = $this->auth->requireRole([$role]);
        $userId = (int) $user['sub'];
        $result = $this->conn->query("SELECT n.id, n.sender_id, n.sender_role, n.title, n.message, n.type, n.related_id, n.seen, n.created_at, u.name as sender_name FROM notifications n LEFT JOIN users u ON n.sender_id = u.id WHERE n.recipient_id = {$userId} ORDER BY n.id DESC");
        Response::json(['notifications' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    protected function markNotificationSeenForRole(string $role): void
    {
        $user = $this->auth->requireRole([$role]);
        $data = $this->request->body();
        $notificationId = (int) ($data['notification_id'] ?? 0);
        $userId = (int) $user['sub'];

        if (!$notificationId) {
            Response::json(['error' => 'Notification ID is required'], 422);
        }

        $stmt = $this->conn->prepare('UPDATE notifications SET seen = 1 WHERE id = ? AND recipient_id = ?');
        $stmt->bind_param('ii', $notificationId, $userId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            Response::json(['message' => 'Notification marked as seen'], 200);
        }

        Response::json(['error' => 'Notification not found or access denied'], 404);
    }

    protected function deleteNotificationForRole(string $role): void
    {
        $user = $this->auth->requireRole([$role]);
        $data = $this->request->body();
        $notificationId = (int) ($data['notification_id'] ?? 0);
        $userId = (int) $user['sub'];

        if (!$notificationId) {
            Response::json(['error' => 'Notification ID is required'], 422);
        }

        $stmt = $this->conn->prepare('DELETE FROM notifications WHERE id = ? AND recipient_id = ?');
        $stmt->bind_param('ii', $notificationId, $userId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            Response::json(['message' => 'Notification deleted'], 200);
        }

        Response::json(['error' => 'Notification not found or access denied'], 404);
    }
}
?>
