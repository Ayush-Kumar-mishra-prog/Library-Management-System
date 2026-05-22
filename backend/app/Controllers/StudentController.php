<?php

namespace App\Controllers;

use Core\Response;
use mysqli_sql_exception;

class StudentController extends BaseController
{
    private function isValidEmail(string $email): bool
    {
        return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    private function isValidUsername(string $username): bool
    {
        return (bool) preg_match('/^(?=.{3,30}$)[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/', $username);
    }

    public function listIssues(): void
    {
        $student = $this->auth->requireRole(['student']);
        $result = $this->conn->query('SELECT i.*, b.title, b.book_name, b.author, b.category FROM issues i JOIN books b ON b.id = i.book_id WHERE i.student_id = ' . (int)$student['sub'] . ' ORDER BY i.id DESC');
        Response::json(['issues' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function createIssueRequest(): void
    {
        $student = $this->auth->requireRole(['student']);
        $data = $this->request->body();
        $bookId = (int)($data['book_id'] ?? 0);
        if ($bookId < 1) {
            Response::json(['error' => 'Invalid book id'], 422);
        }
        $book = $this->conn->query("SELECT id, available_qty FROM books WHERE id = {$bookId}")->fetch_assoc();
        if (!$book) {
            Response::json(['error' => 'Book not found'], 404);
        }
        if ((int)$book['available_qty'] < 1) {
            Response::json(['error' => 'Book currently unavailable'], 400);
        }
        $alreadyIssued = $this->conn->query("SELECT id FROM issues WHERE student_id = {$student['sub']} AND book_id = {$bookId} AND status = 'issued' LIMIT 1")->fetch_assoc();
        if ($alreadyIssued) {
            Response::json(['error' => 'This book is already issued to you'], 400);
        }
        $pending = $this->conn->query("SELECT id FROM issue_requests WHERE student_id = {$student['sub']} AND book_id = {$bookId} AND status = 'pending' LIMIT 1")->fetch_assoc();
        if ($pending) {
            Response::json(['error' => 'Issue request already pending'], 400);
        }
        $status = 'pending';
        $stmt = $this->conn->prepare('INSERT INTO issue_requests (book_id, student_id, status) VALUES (?, ?, ?)');
        $stmt->bind_param('iis', $bookId, $student['sub'], $status);
        $stmt->execute();
        Response::json(['message' => 'Issue request sent to member'], 201);
    }

    public function listIssueRequests(): void
    {
        $student = $this->auth->requireRole(['student']);
        $sql = 'SELECT ir.*, b.title, b.book_name, b.author, b.category
                FROM issue_requests ir
                JOIN books b ON b.id = ir.book_id
                WHERE ir.student_id = ' . (int)$student['sub'] . '
                ORDER BY ir.id DESC';
        $result = $this->conn->query($sql);
        Response::json(['requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function createReissueRequest(): void
    {
        $student = $this->auth->requireRole(['student']);
        $data = $this->request->body();
        $issueId = (int)($data['issue_id'] ?? 0);
        $issue = $this->conn->query("SELECT id, status FROM issues WHERE id = {$issueId} AND student_id = {$student['sub']}")->fetch_assoc();
        if (!$issue || $issue['status'] !== 'issued') {
            Response::json(['error' => 'Invalid issue for reissue'], 400);
        }
        $existing = $this->conn->query("SELECT id FROM reissue_requests WHERE issue_id = {$issueId} AND status = 'pending'")->fetch_assoc();
        if ($existing) {
            Response::json(['error' => 'Reissue request already pending'], 400);
        }
        $status = 'pending';
        $stmt = $this->conn->prepare('INSERT INTO reissue_requests (issue_id, student_id, status) VALUES (?, ?, ?)');
        $stmt->bind_param('iis', $issueId, $student['sub'], $status);
        $stmt->execute();
        Response::json(['message' => 'Reissue request placed'], 201);
    }

    public function listReissueRequests(): void
    {
        $student = $this->auth->requireRole(['student']);
        $sql = 'SELECT rr.*, i.book_id, i.issue_date, i.due_date, b.title, b.book_name, b.author, b.category
                FROM reissue_requests rr
                JOIN issues i ON i.id = rr.issue_id
                JOIN books b ON b.id = i.book_id
                WHERE rr.student_id = ' . (int)$student['sub'] . '
                ORDER BY rr.id DESC';
        $result = $this->conn->query($sql);
        Response::json(['reissue_requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function createReturnRequest(): void
    {
        $student = $this->auth->requireRole(['student']);
        $data = $this->request->body();
        $issueId = (int)($data['issue_id'] ?? 0);

        $issue = $this->conn->query("SELECT id, book_id, status FROM issues WHERE id = {$issueId} AND student_id = {$student['sub']}")->fetch_assoc();
        if (!$issue || $issue['status'] !== 'issued') {
            Response::json(['error' => 'Invalid issue to return'], 400);
        }

        $existing = $this->conn->query("SELECT id FROM return_requests WHERE issue_id = {$issueId} AND status = 'pending'")->fetch_assoc();
        if ($existing) {
            Response::json(['error' => 'Return request already pending'], 400);
        }

        $status = 'pending';
        $stmt = $this->conn->prepare('INSERT INTO return_requests (issue_id, student_id, status) VALUES (?, ?, ?)');
        $stmt->bind_param('iis', $issueId, $student['sub'], $status);
        $stmt->execute();
        $returnRequestId = $stmt->insert_id;
        Response::json(['message' => 'Return request sent to member', 'return_request_id' => $returnRequestId], 201);
    }

    public function listReturnRequests(): void
    {
        $student = $this->auth->requireRole(['student']);
        $sql = 'SELECT rr.*, i.book_id, i.issue_date, i.due_date, b.title, b.book_name, b.author, b.category
                FROM return_requests rr
                JOIN issues i ON i.id = rr.issue_id
                JOIN books b ON b.id = i.book_id
                WHERE rr.student_id = ' . (int)$student['sub'] . '
                ORDER BY rr.id DESC';
        $result = $this->conn->query($sql);
        Response::json(['return_requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function listNotifications(): void
    {
        $student = $this->auth->requireRole(['student']);
        $studentId = (int) $student['sub'];
        $result = $this->conn->query("SELECT n.id, n.sender_id, n.sender_role, n.title, n.message, n.type, n.related_id, n.seen, n.created_at, u.name as sender_name FROM notifications n LEFT JOIN users u ON n.sender_id = u.id WHERE n.recipient_id = {$studentId} ORDER BY n.id DESC");
        Response::json(['notifications' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function profile(): void
    {
        $student = $this->auth->requireRole(['student']);
        $studentId = (int) $student['sub'];
        $result = $this->conn->query("SELECT id, name, username, email, university_id, faculty, department, batch, contact, role FROM users WHERE id = {$studentId} AND role = 'student' LIMIT 1");
        $profile = $result ? $result->fetch_assoc() : null;

        if (!$profile) {
            Response::json(['error' => 'Student not found'], 404);
        }

        Response::json(['profile' => $profile]);
    }

    public function updateProfile(): void
    {
        $student = $this->auth->requireRole(['student']);
        $studentId = (int) $student['sub'];
        $data = $this->request->body();

        $name = trim($data['name'] ?? '');
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $universityId = trim($data['university_id'] ?? '');
        $faculty = trim($data['faculty'] ?? '');
        $department = trim($data['department'] ?? '');
        $batch = trim($data['batch'] ?? '');
        $contact = trim($data['contact'] ?? '');
        $password = (string) ($data['password'] ?? '');

        if (!$name || !$username || !$email || !$universityId) {
            Response::json(['error' => 'Name, username, email, and university ID are required'], 422);
        }
        if (!$this->isValidEmail($email)) {
            Response::json(['error' => 'Please enter a valid email address'], 422);
        }
        if (!$this->isValidUsername($username)) {
            Response::json(['error' => 'Username must be 3-30 characters and may only contain letters, numbers, dot, underscore, or hyphen'], 422);
        }
        if ($password !== '' && strlen($password) < 6) {
            Response::json(['error' => 'Password must be at least 6 characters long'], 422);
        }

        if ($password !== '') {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $this->conn->prepare('UPDATE users SET name = ?, username = ?, email = ?, university_id = ?, faculty = ?, department = ?, batch = ?, contact = ?, password_hash = ? WHERE id = ? AND role = "student"');
            $stmt->bind_param('sssssssssi', $name, $username, $email, $universityId, $faculty, $department, $batch, $contact, $hash, $studentId);
        } else {
            $stmt = $this->conn->prepare('UPDATE users SET name = ?, username = ?, email = ?, university_id = ?, faculty = ?, department = ?, batch = ?, contact = ? WHERE id = ? AND role = "student"');
            $stmt->bind_param('ssssssssi', $name, $username, $email, $universityId, $faculty, $department, $batch, $contact, $studentId);
        }

        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $exception) {
            if ($exception->getCode() === 1062) {
                Response::json(['error' => 'Email or username already exists'], 409);
            }
            Response::json(['error' => 'Student profile update failed'], 500);
        }

        $result = $this->conn->query("SELECT id, name, username, email, university_id, faculty, department, batch, contact, role FROM users WHERE id = {$studentId} AND role = 'student' LIMIT 1");
        $profile = $result ? $result->fetch_assoc() : null;
        Response::json(['message' => 'Profile updated', 'profile' => $profile]);
    }

    public function sendReturnMessage(): void
    {
        $student = $this->auth->requireRole(['student']);
        $data = $this->request->body();
        $studentId = (int)$student['sub'];
        $returnRequestId = (int)($data['return_request_id'] ?? 0);
        $message = trim($data['message'] ?? '');
        $recipient = trim($data['recipient'] ?? '');

        if (!$message || !in_array($recipient, ['member', 'admin'], true)) {
            Response::json(['error' => 'Missing or invalid parameters'], 422);
        }

        $title = "Message from Student";
        $senderRole = 'student';
        $type = 'general_message';
        $seen = 0;

        if ($recipient === 'member') {
            if ($returnRequestId) {
                $returnRequest = $this->conn->query("SELECT id, issue_id FROM return_requests WHERE id = {$returnRequestId} AND student_id = {$studentId}")->fetch_assoc();
                if (!$returnRequest) {
                    Response::json(['error' => 'Return request not found'], 404);
                }
                $issue = $this->conn->query("SELECT member_id FROM issues WHERE id = {$returnRequest['issue_id']}")->fetch_assoc();
                if (!$issue) {
                    Response::json(['error' => 'Issue not found'], 404);
                }
                $memberId = (int)$issue['member_id'];
                $type = 'return_message';
            } else {
                $memberResult = $this->conn->query("SELECT id FROM users WHERE role = 'member' LIMIT 1");
                $member = $memberResult ? $memberResult->fetch_assoc() : null;
                if (!$member) {
                    Response::json(['error' => 'No members available'], 404);
                }
                $memberId = (int)$member['id'];
            }
            $stmt = $this->conn->prepare('INSERT INTO notifications (recipient_id, sender_id, sender_role, title, message, type, related_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('iisssiii', $memberId, $studentId, $senderRole, $title, $message, $type, $returnRequestId, $seen);
        } else {
            $adminResult = $this->conn->query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
            $admin = $adminResult ? $adminResult->fetch_assoc() : null;
            if (!$admin) {
                Response::json(['error' => 'Admin not found'], 404);
            }
            $adminId = (int)$admin['id'];
            $stmt = $this->conn->prepare('INSERT INTO notifications (recipient_id, sender_id, sender_role, title, message, type, related_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('iisssiii', $adminId, $studentId, $senderRole, $title, $message, $type, $returnRequestId, $seen);
        }

        try {
            $stmt->execute();
            Response::json(['message' => 'Message sent successfully'], 201);
        } catch (mysqli_sql_exception $exception) {
            Response::json(['error' => 'Failed to send message'], 500);
        }
    }

    public function markNotificationSeen(): void
    {
        $student = $this->auth->requireRole(['student']);
        $data = $this->request->body();
        $notificationId = (int)($data['notification_id'] ?? 0);
        $studentId = (int)$student['sub'];

        if (!$notificationId) {
            Response::json(['error' => 'Notification ID is required'], 422);
        }

        $stmt = $this->conn->prepare('UPDATE notifications SET seen = 1 WHERE id = ? AND recipient_id = ?');
        $stmt->bind_param('ii', $notificationId, $studentId);
        try {
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                Response::json(['message' => 'Notification marked as seen'], 200);
            } else {
                Response::json(['error' => 'Notification not found or already seen'], 404);
            }
        } catch (mysqli_sql_exception $exception) {
            Response::json(['error' => 'Failed to update notification'], 500);
        }
    }
}
?>
