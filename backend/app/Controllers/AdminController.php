<?php

namespace App\Controllers;

use Core\Response;
use mysqli_sql_exception;

class AdminController extends BaseController
{
    private const BOOK_CATEGORIES = [
        'English',
        'Hindi',
        'Mathematics',
        'Research',
        'Database',
        'Frontend',
        'Backend',
        'Deployment',
        'Story',
        'Poem',
    ];

    private function isValidEmail(string $email): bool
    {
        return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    private function isValidUsername(string $username): bool
    {
        return (bool) preg_match('/^(?=.{3,30}$)[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/', $username);
    }

    public function uploadBookImage(): void
    {
        $this->auth->requireRole(['admin']);
        if (!isset($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
            Response::json(['error' => 'Image file is required'], 422);
        }

        $file = $_FILES['image'];
        if ($file['size'] > 5 * 1024 * 1024) {
            Response::json(['error' => 'File too large. Max 5MB'], 422);
        }

        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];
        $mime = mime_content_type($file['tmp_name']);
        if (!isset($allowed[$mime])) {
            Response::json(['error' => 'Invalid image type. Use jpg/png/webp'], 422);
        }

        $uploadsDir = __DIR__ . '/../../uploads/books';
        if (!is_dir($uploadsDir) && !mkdir($uploadsDir, 0777, true)) {
            Response::json(['error' => 'Unable to create upload directory'], 500);
        }

        $ext = $allowed[$mime];
        $filename = 'book_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadsDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            Response::json(['error' => 'Failed to save image'], 500);
        }

        Response::json([
            'message' => 'Image uploaded',
            'path' => 'uploads/books/' . $filename
        ]);
    }

    public function createMember(): void
    {
        $admin = $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $required = ['name', 'university_id', 'position', 'faculty', 'department', 'batch', 'contact', 'email', 'username', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::json(['error' => "Missing field: $field"], 422);
            }
        }

        $email = trim($data['email']);
        $username = trim($data['username']);
        $password = (string) $data['password'];

        if (!$this->isValidEmail($email)) {
            Response::json(['error' => 'Please enter a valid email address'], 422);
        }
        if (!$this->isValidUsername($username)) {
            Response::json(['error' => 'Username must be 3-30 characters and may only contain letters, numbers, dot, underscore, or hyphen'], 422);
        }
        if (strlen($password) < 6) {
            Response::json(['error' => 'Password must be at least 6 characters long'], 422);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $role = 'member';
        $stmt = $this->conn->prepare('INSERT INTO users (name, university_id, position, faculty, department, batch, contact, email, username, password_hash, role, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param(
            'sssssssssssi',
            $data['name'],
            $data['university_id'],
            $data['position'],
            $data['faculty'],
            $data['department'],
            $data['batch'],
            $data['contact'],
            $email,
            $username,
            $hash,
            $role,
            $admin['sub']
        );
        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $exception) {
            if ($exception->getCode() === 1062) {
                Response::json(['error' => 'Email ya username already exists'], 409);
            }
            Response::json(['error' => 'Member creation failed'], 500);
        }
        Response::json(['message' => 'Member created'], 201);
    }

    public function listMembers(): void
    {
        $this->auth->requireRole(['admin']);
        $result = $this->conn->query("SELECT id, name, university_id, position, faculty, department, batch, contact, email, username, role, created_at FROM users WHERE role = 'member' ORDER BY id DESC");
        Response::json(['members' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function memberCredentials(): void
    {
        $this->auth->requireRole(['admin']);
        $result = $this->conn->query("SELECT id, name, username, email, contact, created_at FROM users WHERE role = 'member' ORDER BY id DESC");
        Response::json(['credentials' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function deleteMember(): void
    {
        $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $memberId = (int)($data['member_id'] ?? 0);
        if ($memberId < 1) {
            Response::json(['error' => 'Invalid member id'], 422);
        }
        $member = $this->conn->query("SELECT id FROM users WHERE id = {$memberId} AND role = 'member'")->fetch_assoc();
        if (!$member) {
            Response::json(['error' => 'Member not found'], 404);
        }
        $activeIssue = $this->conn->query("SELECT id FROM issues WHERE member_id = {$memberId} AND status = 'issued' LIMIT 1")->fetch_assoc();
        if ($activeIssue) {
            Response::json(['error' => 'Cannot remove member with active issued books'], 400);
        }
        $stmt = $this->conn->prepare('DELETE FROM users WHERE id = ? AND role = "member"');
        $stmt->bind_param('i', $memberId);
        $stmt->execute();
        Response::json(['message' => 'Member removed']);
    }

    public function updateMember(): void
    {
        $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $memberId = (int)($data['member_id'] ?? 0);
        if ($memberId < 1) {
            Response::json(['error' => 'Invalid member id'], 422);
        }
        $member = $this->conn->query("SELECT id FROM users WHERE id = {$memberId} AND role = 'member'")->fetch_assoc();
        if (!$member) {
            Response::json(['error' => 'Member not found'], 404);
        }

        $name = trim($data['name'] ?? '');
        $position = trim($data['position'] ?? '');
        $faculty = trim($data['faculty'] ?? '');
        $department = trim($data['department'] ?? '');
        $batch = trim($data['batch'] ?? '');
        $contact = trim($data['contact'] ?? '');
        $email = trim($data['email'] ?? '');
        $username = trim($data['username'] ?? '');

        if (!$name || !$email || !$username) {
            Response::json(['error' => 'Name, email and username are required'], 422);
        }

        $stmt = $this->conn->prepare('UPDATE users SET name = ?, position = ?, faculty = ?, department = ?, batch = ?, contact = ?, email = ?, username = ? WHERE id = ? AND role = "member"');
        $stmt->bind_param('ssssssssi', $name, $position, $faculty, $department, $batch, $contact, $email, $username, $memberId);
        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $exception) {
            if ($exception->getCode() === 1062) {
                Response::json(['error' => 'Email ya username already exists'], 409);
            }
            Response::json(['error' => 'Member update failed'], 500);
        }
        Response::json(['message' => 'Member updated']);
    }

    public function listStudents(): void
    {
        $this->auth->requireRole(['admin']);
        $result = $this->conn->query("SELECT id, name, university_id, faculty, department, batch, contact, email, username, role, created_at FROM users WHERE role = 'student' ORDER BY id DESC");
        Response::json(['students' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function deleteStudent(): void
    {
        $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $studentId = (int)($data['student_id'] ?? 0);
        if ($studentId < 1) {
            Response::json(['error' => 'Invalid student id'], 422);
        }
        $student = $this->conn->query("SELECT id FROM users WHERE id = {$studentId} AND role = 'student'")->fetch_assoc();
        if (!$student) {
            Response::json(['error' => 'Student not found'], 404);
        }
        $activeIssue = $this->conn->query("SELECT id FROM issues WHERE student_id = {$studentId} AND status = 'issued' LIMIT 1")->fetch_assoc();
        if ($activeIssue) {
            Response::json(['error' => 'Cannot remove student with active issued books'], 400);
        }
        $pendingIssue = $this->conn->query("SELECT id FROM issue_requests WHERE student_id = {$studentId} AND status = 'pending' LIMIT 1")->fetch_assoc();
        $pendingReturn = $this->conn->query("SELECT id FROM return_requests WHERE student_id = {$studentId} AND status = 'pending' LIMIT 1")->fetch_assoc();
        $pendingReissue = $this->conn->query("SELECT id FROM reissue_requests WHERE student_id = {$studentId} AND status = 'pending' LIMIT 1")->fetch_assoc();
        if ($pendingIssue || $pendingReturn || $pendingReissue) {
            Response::json(['error' => 'Cannot remove student with pending library requests'], 400);
        }
        $stmt = $this->conn->prepare('DELETE FROM users WHERE id = ? AND role = "student"');
        $stmt->bind_param('i', $studentId);
        $stmt->execute();
        Response::json(['message' => 'Student removed']);
    }

    public function messageStudent(): void
    {
        $admin = $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $studentId = (int)($data['student_id'] ?? 0);
        $title = trim($data['title'] ?? '');
        $message = trim($data['message'] ?? '');
        if ($studentId < 1 || !$title || !$message) {
            Response::json(['error' => 'Student, title and message are required'], 422);
        }
        $student = $this->conn->query("SELECT id FROM users WHERE id = {$studentId} AND role = 'student'")->fetch_assoc();
        if (!$student) {
            Response::json(['error' => 'Student not found'], 404);
        }
        $this->createNotification($studentId, (int) $admin['sub'], 'admin', $title, $message, 'message');
        Response::json(['message' => 'Message sent to student']);
    }

    public function listNotifications(): void
    {
        $this->listNotificationsForRole('admin');
    }

    public function markNotificationSeen(): void
    {
        $this->markNotificationSeenForRole('admin');
    }

    public function deleteNotification(): void
    {
        $this->deleteNotificationForRole('admin');
    }

    public function createBook(): void
    {
        $admin = $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $required = ['book_uid', 'book_number', 'book_name', 'title', 'description', 'author', 'publish_date', 'image_url', 'total_qty'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::json(['error' => "Missing field: $field"], 422);
            }
        }

        $qty = (int)$data['total_qty'];
        $category = trim($data['category'] ?? '');
        if (!in_array($category, self::BOOK_CATEGORIES, true)) {
            Response::json(['error' => 'Invalid category selected'], 422);
        }

        $stmt = $this->conn->prepare('INSERT INTO books (book_uid, book_number, book_name, title, description, author, publish_date, image_url, total_qty, available_qty, category, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param(
            'ssssssssiisi',
            $data['book_uid'],
            $data['book_number'],
            $data['book_name'],
            $data['title'],
            $data['description'],
            $data['author'],
            $data['publish_date'],
            $data['image_url'],
            $qty,
            $qty,
            $category,
            $admin['sub']
        );
        if (!$stmt->execute()) {
            Response::json(['error' => 'Book creation failed'], 400);
        }
        Response::json(['message' => 'Book added'], 201);
    }

    public function listBookRequests(): void
    {
        $this->auth->requireRole(['admin']);
        $sql = 'SELECT br.*, u.name as member_name, u.username as member_username
                FROM book_requests br
                JOIN users u ON u.id = br.requested_by_member_id
                ORDER BY br.id DESC';
        $result = $this->conn->query($sql);
        Response::json(['requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function updateBookRequestStatus(): void
    {
        $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);
        $status = trim($data['status'] ?? '');
        $allowed = ['pending', 'seen', 'closed'];
        if ($requestId < 1 || !in_array($status, $allowed, true)) {
            Response::json(['error' => 'Invalid request/status'], 422);
        }
        $stmt = $this->conn->prepare('UPDATE book_requests SET status = ? WHERE id = ?');
        $stmt->bind_param('si', $status, $requestId);
        $stmt->execute();
        Response::json(['message' => 'Book request status updated']);
    }
}
?>
