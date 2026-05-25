<?php

namespace App\Controllers;

use Core\Response;
use DateTime;

class MemberController extends BaseController
{
    public function issueBook(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $bookId = (int)($data['book_id'] ?? 0);
        $studentId = (int)($data['student_id'] ?? 0);
        $issueDateInput = trim($data['issue_date'] ?? '');

        $book = $this->conn->query("SELECT id, available_qty FROM books WHERE id = {$bookId}")->fetch_assoc();
        if (!$book || (int)$book['available_qty'] < 1) {
            Response::json(['error' => 'Book not available'], 400);
        }
        $student = $this->conn->query("SELECT id FROM users WHERE id = {$studentId} AND role = 'student'")->fetch_assoc();
        if (!$student) {
            Response::json(['error' => 'Invalid student id'], 400);
        }

        $issueDate = $issueDateInput ? date('Y-m-d', strtotime($issueDateInput)) : date('Y-m-d');
        $dueDate = date('Y-m-d', strtotime($issueDate . ' +15 days'));
        $status = 'issued';

        $stmt = $this->conn->prepare('INSERT INTO issues (book_id, student_id, member_id, issue_date, due_date, status, penalty) VALUES (?, ?, ?, ?, ?, ?, 0)');
        $stmt->bind_param('iiisss', $bookId, $studentId, $member['sub'], $issueDate, $dueDate, $status);
        $stmt->execute();
        $this->conn->query("UPDATE books SET available_qty = available_qty - 1 WHERE id = {$bookId}");
        $this->createNotification(
            $studentId,
            (int) $member['sub'],
            'member',
            'Book issued successfully',
            "Your requested book has been issued. Due date: {$dueDate}.",
            'issue'
        );
        Response::json(['message' => 'Book issued']);
    }

    public function listIssueRequests(): void
    {
        $this->auth->requireRole(['member']);
        $sql = 'SELECT ir.*, u.name as student_name, u.university_id, b.title, b.book_name, b.author, b.category
                FROM issue_requests ir
                JOIN users u ON u.id = ir.student_id
                JOIN books b ON b.id = ir.book_id
                WHERE ir.status = "pending"
                ORDER BY ir.id DESC';
        $result = $this->conn->query($sql);
        Response::json(['requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function approveIssueRequest(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);
        $issueDateInput = trim($data['issue_date'] ?? '');

        $request = $this->conn->query("SELECT * FROM issue_requests WHERE id = {$requestId} AND status = 'pending'")->fetch_assoc();
        if (!$request) {
            Response::json(['error' => 'Request not found'], 404);
        }

        $bookId = (int)$request['book_id'];
        $studentId = (int)$request['student_id'];
        $book = $this->conn->query("SELECT id, available_qty FROM books WHERE id = {$bookId}")->fetch_assoc();
        if (!$book || (int)$book['available_qty'] < 1) {
            Response::json(['error' => 'Book not available'], 400);
        }

        $issueDate = $issueDateInput ? date('Y-m-d', strtotime($issueDateInput)) : date('Y-m-d');
        $dueDate = date('Y-m-d', strtotime($issueDate . ' +15 days'));
        $status = 'issued';

        $stmt = $this->conn->prepare('INSERT INTO issues (book_id, student_id, member_id, issue_date, due_date, status, penalty) VALUES (?, ?, ?, ?, ?, ?, 0)');
        $stmt->bind_param('iiisss', $bookId, $studentId, $member['sub'], $issueDate, $dueDate, $status);
        $stmt->execute();
        $this->conn->query("UPDATE books SET available_qty = available_qty - 1 WHERE id = {$bookId}");

        $processedStatus = 'approved';
        $stmt2 = $this->conn->prepare('UPDATE issue_requests SET status = ?, processed_by_member_id = ?, processed_at = NOW() WHERE id = ?');
        $stmt2->bind_param('sii', $processedStatus, $member['sub'], $requestId);
        $stmt2->execute();
        $this->createNotification(
            $studentId,
            (int) $member['sub'],
            'member',
            'Issue request approved',
            "Your request for this book has been approved. Due date: {$dueDate}.",
            'issue-request'
        );
        Response::json(['message' => 'Issue request approved and book issued']);
    }

    public function rejectIssueRequest(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);
        $request = $this->conn->query("SELECT id FROM issue_requests WHERE id = {$requestId} AND status = 'pending'")->fetch_assoc();
        if (!$request) {
            Response::json(['error' => 'Request not found'], 404);
        }
        $status = 'rejected';
        $stmt = $this->conn->prepare('UPDATE issue_requests SET status = ?, processed_by_member_id = ?, processed_at = NOW() WHERE id = ?');
        $stmt->bind_param('sii', $status, $member['sub'], $requestId);
        $stmt->execute();
        $requestDetails = $this->conn->query("SELECT student_id, book_id FROM issue_requests WHERE id = {$requestId} LIMIT 1")->fetch_assoc();
        if ($requestDetails) {
            $this->createNotification(
                (int) $requestDetails['student_id'],
                (int) $member['sub'],
                'member',
                'Issue request rejected',
                'Your issue request was rejected by the library member.',
                'issue-request'
            );
        }
        Response::json(['message' => 'Issue request rejected']);
    }

    public function listStudents(): void
    {
        $this->auth->requireRole(['member']);
        $result = $this->conn->query("SELECT id, name, university_id, email, username, department, batch, faculty, contact, created_at FROM users WHERE role = 'student' ORDER BY id DESC");
        Response::json(['students' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function deleteStudent(): void
    {
        $this->auth->requireRole(['member']);
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
        $member = $this->auth->requireRole(['member']);
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
        $this->createNotification($studentId, (int) $member['sub'], 'member', $title, $message, 'message');
        Response::json(['message' => 'Message sent to student']);
    }

    public function listNotifications(): void
    {
        $this->listNotificationsForRole('member');
    }

    public function markNotificationSeen(): void
    {
        $this->markNotificationSeenForRole('member');
    }

    public function deleteNotification(): void
    {
        $this->deleteNotificationForRole('member');
    }

    public function returnBook(): void
    {
        $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $issueId = (int)($data['issue_id'] ?? 0);

        $issue = $this->conn->query("SELECT * FROM issues WHERE id = {$issueId}")->fetch_assoc();
        if (!$issue || $issue['status'] !== 'issued') {
            Response::json(['error' => 'Issue record invalid'], 400);
        }

        $today = new DateTime(date('Y-m-d'));
        $due = new DateTime($issue['due_date']);
        $lateDays = (int)$due->diff($today)->format('%r%a');
        $lateDays = $lateDays > 0 ? $lateDays : 0;
        $penalty = $lateDays * 5;

        $returnDate = date('Y-m-d');
        $status = 'returned';
        $stmt = $this->conn->prepare('UPDATE issues SET return_date = ?, status = ?, penalty = ? WHERE id = ?');
        $stmt->bind_param('ssii', $returnDate, $status, $penalty, $issueId);
        $stmt->execute();
        $this->conn->query('UPDATE books SET available_qty = available_qty + 1 WHERE id = ' . (int)$issue['book_id']);
        Response::json(['message' => 'Book returned', 'penalty' => $penalty, 'late_days' => $lateDays]);
    }

    public function listIssues(): void
    {
        $this->auth->requireRole(['member']);
        $sql = 'SELECT i.*, b.title, b.book_name, b.category, s.name as student_name FROM issues i
                JOIN books b ON b.id = i.book_id
                JOIN users s ON s.id = i.student_id
                ORDER BY i.id DESC';
        $result = $this->conn->query($sql);
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $todayTs = strtotime(date('Y-m-d'));
        foreach ($rows as &$row) {
            $dueTs = strtotime($row['due_date']);
            $lateDays = $todayTs > $dueTs ? (int)floor(($todayTs - $dueTs) / 86400) : 0;
            $row['live_penalty'] = $lateDays * 5;
            $row['late_days'] = $lateDays;
        }
        Response::json(['issues' => $rows]);
    }

    public function createBookRequest(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $stmt = $this->conn->prepare('INSERT INTO book_requests (requested_by_member_id, title, author, message, status) VALUES (?, ?, ?, ?, ?)');
        $status = 'pending';
        $title = trim($data['title'] ?? '');
        $author = trim($data['author'] ?? '');
        $message = trim($data['message'] ?? '');
        $stmt->bind_param('issss', $member['sub'], $title, $author, $message, $status);
        $stmt->execute();
        Response::json(['message' => 'Book request sent to admin'], 201);
    }

    public function listReissueRequests(): void
    {
        $this->auth->requireRole(['member']);
        $sql = 'SELECT rr.*, i.due_date, i.id as issue_ref, u.name as student_name, b.title, b.category
                FROM reissue_requests rr
                JOIN issues i ON i.id = rr.issue_id
                JOIN users u ON u.id = rr.student_id
                JOIN books b ON b.id = i.book_id
                WHERE rr.status = "pending"
                ORDER BY rr.id DESC';
        $result = $this->conn->query($sql);
        Response::json(['requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function approveReissue(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);
        $extraDays = max(1, (int)($data['extra_days'] ?? 7));

        $request = $this->conn->query("SELECT * FROM reissue_requests WHERE id = {$requestId} AND status = 'pending'")->fetch_assoc();
        if (!$request) {
            Response::json(['error' => 'Request not found'], 404);
        }

        $issueId = (int)$request['issue_id'];
        $issue = $this->conn->query("SELECT due_date FROM issues WHERE id = {$issueId}")->fetch_assoc();
        $newDueDate = date('Y-m-d', strtotime($issue['due_date'] . " +{$extraDays} days"));

        $stmt = $this->conn->prepare('UPDATE issues SET due_date = ? WHERE id = ?');
        $stmt->bind_param('si', $newDueDate, $issueId);
        $stmt->execute();

        $status = 'approved';
        $stmt2 = $this->conn->prepare('UPDATE reissue_requests SET status = ?, processed_by = ? WHERE id = ?');
        $stmt2->bind_param('sii', $status, $member['sub'], $requestId);
        $stmt2->execute();
        $this->createNotification(
            (int) $request['student_id'],
            (int) $member['sub'],
            'member',
            'Reissue request approved',
            "Your due date has been extended to {$newDueDate}.",
            'reissue'
        );
        Response::json(['message' => 'Reissue approved', 'new_due_date' => $newDueDate]);
    }

    public function rejectReissue(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);
        $request = $this->conn->query("SELECT id FROM reissue_requests WHERE id = {$requestId} AND status = 'pending'")->fetch_assoc();
        if (!$request) {
            Response::json(['error' => 'Request not found'], 404);
        }
        $status = 'rejected';
        $stmt = $this->conn->prepare('UPDATE reissue_requests SET status = ?, processed_by = ? WHERE id = ?');
        $stmt->bind_param('sii', $status, $member['sub'], $requestId);
        $stmt->execute();
        $studentId = (int)($request['student_id'] ?? 0);
        if ($studentId > 0) {
            $this->createNotification(
                $studentId,
                (int) $member['sub'],
                'member',
                'Reissue request rejected',
                'Your reissue request was rejected by the library member.',
                'reissue'
            );
        }
        Response::json(['message' => 'Reissue request rejected']);
    }
    public function listReturnRequests(): void
    {
        $this->auth->requireRole(['member']);
        $sql = 'SELECT rr.*, i.issue_date, i.due_date, i.book_id, u.name as student_name, u.university_id, b.title, b.book_name, b.author, b.category
                FROM return_requests rr
                JOIN issues i ON i.id = rr.issue_id
                JOIN users u ON u.id = rr.student_id
                JOIN books b ON b.id = i.book_id
                WHERE rr.status = "pending"
                ORDER BY rr.requested_at DESC';
        $result = $this->conn->query($sql);
        Response::json(['requests' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function approveReturnRequest(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);

        $request = $this->conn->query("SELECT * FROM return_requests WHERE id = {$requestId} AND status = 'pending'")->fetch_assoc();
        if (!$request) {
            Response::json(['error' => 'Return request not found'], 404);
        }

        $issueId = (int)$request['issue_id'];
        $issue = $this->conn->query("SELECT * FROM issues WHERE id = {$issueId} AND status = 'issued'")->fetch_assoc();
        if (!$issue) {
            Response::json(['error' => 'Issue record not available for return'], 400);
        }

        $today = new DateTime(date('Y-m-d'));
        $due = new DateTime($issue['due_date']);
        $lateDays = (int)$due->diff($today)->format('%r%a');
        $lateDays = $lateDays > 0 ? $lateDays : 0;
        $penalty = $lateDays * 5;

        $returnDate = date('Y-m-d');
        $status = 'returned';
        $stmt = $this->conn->prepare('UPDATE issues SET return_date = ?, status = ?, penalty = ? WHERE id = ?');
        $stmt->bind_param('ssii', $returnDate, $status, $penalty, $issueId);
        $stmt->execute();
        $this->conn->query('UPDATE books SET available_qty = available_qty + 1 WHERE id = ' . (int)$issue['book_id']);

        $processedStatus = 'approved';
        $stmt2 = $this->conn->prepare('UPDATE return_requests SET status = ?, processed_by_member_id = ?, processed_at = NOW() WHERE id = ?');
        $stmt2->bind_param('sii', $processedStatus, $member['sub'], $requestId);
        $stmt2->execute();
        $this->createNotification(
            (int) $request['student_id'],
            (int) $member['sub'],
            'member',
            'Return request approved',
            "Your return request has been approved. Penalty: Rs {$penalty}.",
            'return'
        );

        Response::json(['message' => 'Return request approved and book returned', 'penalty' => $penalty, 'late_days' => $lateDays]);
    }

    public function rejectReturnRequest(): void
    {
        $member = $this->auth->requireRole(['member']);
        $data = $this->request->body();
        $requestId = (int)($data['request_id'] ?? 0);
        $request = $this->conn->query("SELECT id FROM return_requests WHERE id = {$requestId} AND status = 'pending'")->fetch_assoc();
        if (!$request) {
            Response::json(['error' => 'Return request not found'], 404);
        }
        $status = 'rejected';
        $stmt = $this->conn->prepare('UPDATE return_requests SET status = ?, processed_by_member_id = ?, processed_at = NOW() WHERE id = ?');
        $stmt->bind_param('sii', $status, $member['sub'], $requestId);
        $stmt->execute();
        $studentId = (int)($request['student_id'] ?? 0);
        if ($studentId > 0) {
            $this->createNotification(
                $studentId,
                (int) $member['sub'],
                'member',
                'Return request rejected',
                'Your return request was rejected by the library member.',
                'return'
            );
        }
        Response::json(['message' => 'Return request rejected']);
    }}
    ?>
