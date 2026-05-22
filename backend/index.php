<?php



require_once __DIR__ . '/bootstrap.php';

use App\Controllers\AdminController;
use App\Controllers\AuthController;
use App\Controllers\BookController;
use App\Controllers\MemberController;
use App\Controllers\StudentController;
use App\Router;
use Core\Auth;
use Core\Request;

$conn = get_db_connection();

$bookCategoryColumn = $conn->query("SHOW COLUMNS FROM books LIKE 'category'");
if ($bookCategoryColumn && $bookCategoryColumn->num_rows === 0) {
    $conn->query("ALTER TABLE books ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General' AFTER available_qty");
}

$conn->query("CREATE TABLE IF NOT EXISTS issue_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    processed_by_member_id INT DEFAULT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL
)");

$conn->query("CREATE TABLE IF NOT EXISTS return_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    processed_by_member_id INT DEFAULT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL
)");

$conn->query("CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    sender_id INT DEFAULT NULL,
    sender_role VARCHAR(20) NOT NULL DEFAULT 'system',
    title VARCHAR(190) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    related_id INT DEFAULT NULL,
    seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$seenColumn = $conn->query("SHOW COLUMNS FROM notifications LIKE 'seen'");
if ($seenColumn && $seenColumn->num_rows === 0) {
    $conn->query("ALTER TABLE notifications ADD COLUMN seen BOOLEAN DEFAULT FALSE");
}

$relatedIdColumn = $conn->query("SHOW COLUMNS FROM notifications LIKE 'related_id'");
if ($relatedIdColumn && $relatedIdColumn->num_rows === 0) {
    $conn->query("ALTER TABLE notifications ADD COLUMN related_id INT DEFAULT NULL");
}

$request = new Request();
$auth = new Auth();
$router = new Router($conn, $request, $auth);

$router->register('POST', 'admin/upload-book-image', AdminController::class, 'uploadBookImage');
$router->register('POST', 'auth/login', AuthController::class, 'login');
$router->register('POST', 'auth/signup-student', AuthController::class, 'signupStudent');

$router->register('POST', 'admin/members', AdminController::class, 'createMember');
$router->register('GET', 'admin/members', AdminController::class, 'listMembers');
$router->register('GET', 'admin/member-credentials', AdminController::class, 'memberCredentials');
$router->register('POST', 'admin/members/delete', AdminController::class, 'deleteMember');
$router->register('POST', 'admin/members/update', AdminController::class, 'updateMember');
$router->register('GET', 'admin/students', AdminController::class, 'listStudents');
$router->register('POST', 'admin/students/delete', AdminController::class, 'deleteStudent');
$router->register('POST', 'admin/students/message', AdminController::class, 'messageStudent');
$router->register('POST', 'admin/books', AdminController::class, 'createBook');
$router->register('GET', 'admin/book-requests', AdminController::class, 'listBookRequests');
$router->register('POST', 'admin/book-requests/update-status', AdminController::class, 'updateBookRequestStatus');

$router->register('GET', 'books', BookController::class, 'list');
$router->register('POST', 'admin/books/delete', BookController::class, 'delete');

$router->register('POST', 'member/issue-book', MemberController::class, 'issueBook');
$router->register('GET', 'member/issue-requests', MemberController::class, 'listIssueRequests');
$router->register('POST', 'member/issue-request-approve', MemberController::class, 'approveIssueRequest');
$router->register('POST', 'member/issue-request-reject', MemberController::class, 'rejectIssueRequest');
$router->register('GET', 'member/students', MemberController::class, 'listStudents');
$router->register('POST', 'member/students/delete', MemberController::class, 'deleteStudent');
$router->register('POST', 'member/students/message', MemberController::class, 'messageStudent');
$router->register('POST', 'member/return-book', MemberController::class, 'returnBook');
$router->register('GET', 'member/issues', MemberController::class, 'listIssues');
$router->register('POST', 'member/book-requests', MemberController::class, 'createBookRequest');
$router->register('GET', 'member/reissue-requests', MemberController::class, 'listReissueRequests');
$router->register('POST', 'member/reissue-approve', MemberController::class, 'approveReissue');
$router->register('POST', 'member/reissue-reject', MemberController::class, 'rejectReissue');

$router->register('GET', 'student/issues', StudentController::class, 'listIssues');
$router->register('POST', 'student/issue-request', StudentController::class, 'createIssueRequest');
$router->register('GET', 'student/issue-requests', StudentController::class, 'listIssueRequests');
$router->register('GET', 'student/return-requests', StudentController::class, 'listReturnRequests');
$router->register('GET', 'student/reissue-requests', StudentController::class, 'listReissueRequests');
$router->register('GET', 'student/notifications', StudentController::class, 'listNotifications');
$router->register('POST', 'student/return-message', StudentController::class, 'sendReturnMessage');
$router->register('POST', 'student/mark-notification-seen', StudentController::class, 'markNotificationSeen');
$router->register('GET', 'student/profile', StudentController::class, 'profile');
$router->register('POST', 'student/profile', StudentController::class, 'updateProfile');
$router->register('POST', 'student/return-request', StudentController::class, 'createReturnRequest');
$router->register('POST', 'student/reissue-request', StudentController::class, 'createReissueRequest');

$router->register('GET', 'member/return-requests', MemberController::class, 'listReturnRequests');
$router->register('POST', 'member/return-request-approve', MemberController::class, 'approveReturnRequest');
$router->register('POST', 'member/return-request-reject', MemberController::class, 'rejectReturnRequest');

$router->dispatch();

?>
