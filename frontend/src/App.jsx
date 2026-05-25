import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminLayout from "./layouts/AdminLayout";
import MemberLayout from "./layouts/MemberLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAddBookPage from "./pages/admin/AdminAddBookPage";
import AdminCreateMemberPage from "./pages/admin/AdminCreateMemberPage";
import AdminMemberCredentialsPage from "./pages/admin/AdminMemberCredentialsPage";
import AdminBookRequestsPage from "./pages/admin/AdminBookRequestsPage";
import AdminBooksPage from "./pages/admin/AdminBooksPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import MemberDashboardPage from "./pages/member/MemberDashboardPage";
import MemberIssueBookPage from "./pages/member/MemberIssueBookPage";
import MemberNotificationsPage from "./pages/member/MemberNotificationsPage";
import MemberRequestBookPage from "./pages/member/MemberRequestBookPage";
import MemberStudentRequestsPage from "./pages/member/MemberStudentRequestsPage";
import MemberReturnRequestsPage from "./pages/member/MemberReturnRequestsPage";
import MemberTrackingPage from "./pages/member/MemberTrackingPage";
import MemberReissuePage from "./pages/member/MemberReissuePage";
import MemberStudentsPage from "./pages/member/MemberStudentsPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import MembersManagementPage from "./pages/MembersManagementPage";
import LoginForm from "./components/LoginForm";
import MemberLoginPage from "./components/MemberLoginPage";
import StudentLoginPage from "./components/StudentLoginPage";
import StudentLayout from "./pages/StudentLayout";
import StudentBooks from "./pages/StudentBooks";
import NotificationStudent from "./pages/NotificationStudent";
import Settings from "./pages/Settings";
import StudentIssuedBooks from "./pages/StudentIssuedBooks";
import StudentDashboard from "./pages/StudentDashboard";

function getSessionUser() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!token || !user?.role) return null;
  return user;
}

function ProtectedRoute({ role, children }) {
  const user = getSessionUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const user = getSessionUser();
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/admin-login"
        element={
          <PublicRoute>
           <LoginForm />
          </PublicRoute>
        }
      />
       <Route
        path="/member-login"
        element={
          <PublicRoute>
          <MemberLoginPage />
          </PublicRoute>
        }
      />
       <Route
        path="/student-login"
        element={
          <PublicRoute>
          <StudentLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="add-book" element={<AdminAddBookPage />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="create-member" element={<AdminCreateMemberPage />} />
        <Route path="members" element={<MembersManagementPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route
          path="member-credentials"
          element={<AdminMemberCredentialsPage />}
        />
        <Route path="book-requests" element={<AdminBookRequestsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>
      <Route
        path="/member"
        element={
          <ProtectedRoute role="member">
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboardPage />} />
        <Route path="issue-book" element={<MemberIssueBookPage />} />
        <Route path="request-book" element={<MemberRequestBookPage />} />
        <Route
          path="student-requests"
          element={<MemberStudentRequestsPage />}
        />
        <Route path="return-requests" element={<MemberReturnRequestsPage />} />
        <Route path="tracking" element={<MemberTrackingPage />} />
        <Route path="reissue" element={<MemberReissuePage />} />
        <Route path="students" element={<MemberStudentsPage />} />
        <Route path="notifications" element={<MemberNotificationsPage />} />
      </Route>
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="books" element={<StudentBooks />} />
        <Route path="search" element={<Navigate to="/student/books" replace />} />
        <Route path="notifications" element={<NotificationStudent />} />
        <Route path="settings" element={<Settings />} />
        <Route path="issued-books" element={<StudentIssuedBooks />} />
      </Route>
      <Route path="/student-dashboard" element={<Navigate to="/student" replace />} />
      <Route path="/student-books" element={<Navigate to="/student/books" replace />} />
      <Route path="/student-search" element={<Navigate to="/student/search" replace />} />
      <Route path="/student-notification" element={<Navigate to="/student/notifications" replace />} />
      <Route path="/student-settings" element={<Navigate to="/student/settings" replace />} />
      <Route path="/student-issued-books" element={<Navigate to="/student/issued-books" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
