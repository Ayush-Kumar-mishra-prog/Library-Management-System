<?php

namespace App\Controllers;

use Core\Response;

class BookController extends BaseController
{
    public function list(): void
    {
        $this->auth->requireRole(['admin', 'member', 'student']);
        $result = $this->conn->query('SELECT * FROM books ORDER BY id DESC');
        Response::json(['books' => $result->fetch_all(MYSQLI_ASSOC)]);
    }

    public function delete(): void
    {
        $this->auth->requireRole(['admin']);
        $data = $this->request->body();
        $bookId = (int)($data['book_id'] ?? 0);
        if ($bookId < 1) {
            Response::json(['error' => 'Invalid book id'], 422);
        }
        $book = $this->conn->query("SELECT id FROM books WHERE id = {$bookId}")->fetch_assoc();
        if (!$book) {
            Response::json(['error' => 'Book not found'], 404);
        }
        $activeIssue = $this->conn->query("SELECT id FROM issues WHERE book_id = {$bookId} AND status = 'issued' LIMIT 1")->fetch_assoc();
        if ($activeIssue) {
            Response::json(['error' => 'Cannot delete book with active issued copies'], 400);
        }
        $stmt = $this->conn->prepare('DELETE FROM books WHERE id = ?');
        $stmt->bind_param('i', $bookId);
        $stmt->execute();
        Response::json(['message' => 'Book deleted']);
    }
}
?>