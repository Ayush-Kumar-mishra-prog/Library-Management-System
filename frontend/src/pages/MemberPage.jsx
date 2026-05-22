import { useEffect, useState } from "react";
import {
  BellRing,
  BookMarked,
  BookPlus,
  ClipboardList,
  RefreshCcw,
  UserSquare2,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../api";
import { member } from "../assets/assets";
import DashboardShell from "../components/DashboardShell";

export default function MemberPage() {
  const [issueForm, setIssueForm] = useState({
    book_id: "",
    student_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
  });
  const [requestForm, setRequestForm] = useState({
    title: "",
    author: "",
    message: "",
  });
  const [issues, setIssues] = useState([]);
  const [reissueRequests, setReissueRequests] = useState([]);
  const [issueRequests, setIssueRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const load = async () => {
    try {
      const [i, rr, b, s, ir] = await Promise.all([
        apiFetch("member/issues"),
        apiFetch("member/reissue-requests"),
        apiFetch("books"),
        apiFetch("member/students"),
        apiFetch("member/issue-requests"),
      ]);
      setIssues(i.issues);
      setReissueRequests(rr.requests);
      setBooks(b.books || []);
      setStudents(s.students || []);
      setIssueRequests(ir.requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const issueBook = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("member/issue-book", {
        method: "POST",
        body: JSON.stringify(issueForm),
      });
      toast.success("Book issued");
      setIssueForm({
        book_id: "",
        student_id: "",
        issue_date: new Date().toISOString().slice(0, 10),
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const requestBookFromAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("member/book-requests", {
        method: "POST",
        body: JSON.stringify(requestForm),
      });
      toast.success("Request sent to admin");
      setRequestForm({ title: "", author: "", message: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const returnBook = async (issueId) => {
    try {
      const result = await apiFetch("member/return-book", {
        method: "POST",
        body: JSON.stringify({ issue_id: issueId }),
      });
      toast.success(`Returned. Penalty: Rs ${result.penalty}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const approveReissue = async (requestId) => {
    try {
      await apiFetch("member/reissue-approve", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId, extra_days: 15 }),
      });
      toast.success("Reissue approved");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rejectReissue = async (requestId) => {
    try {
      await apiFetch("member/reissue-reject", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId }),
      });
      toast.success("Reissue rejected");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const approveIssueRequest = async (requestId) => {
    try {
      await apiFetch("member/issue-request-approve", {
        method: "POST",
        body: JSON.stringify({
          request_id: requestId,
          issue_date: new Date().toISOString().slice(0, 10),
        }),
      });
      toast.success("Issue request approved");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rejectIssueRequest = async (requestId) => {
    try {
      await apiFetch("member/issue-request-reject", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId }),
      });
      toast.success("Issue request rejected");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardShell
      title="Member Dashboard"
      subtitle="Issue, track, return, and reissue books for students"
      bannerImage={member}
      icon={UserSquare2}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={issueBook}
          className="rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BookPlus className="h-5 w-5 text-blue-600" />
            Issue Book to Student
          </h2>
          <select
            className="w-full rounded-xl border border-slate-200 p-2.5"
            value={issueForm.book_id}
            onChange={(e) =>
              setIssueForm({ ...issueForm, book_id: e.target.value })
            }
          >
            <option value="">Select Book</option>
            {books.map((b) => (
              <option key={b.id} value={b.id} disabled={b.available_qty < 1}>
                {b.id} - {b.title} [{b.category || "General"}] ({b.available_qty}/{b.total_qty} available)
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-xl border border-slate-200 p-2.5"
            value={issueForm.student_id}
            onChange={(e) =>
              setIssueForm({ ...issueForm, student_id: e.target.value })
            }
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} - {s.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl border border-slate-200 p-2.5"
            type="date"
            value={issueForm.issue_date}
            onChange={(e) =>
              setIssueForm({ ...issueForm, issue_date: e.target.value })
            }
          />
          <p className="text-xs text-slate-500">
            Book fixed 15 days ke liye issue hogi. Uske baad Rs 5/day penalty.
          </p>
          <button className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white">
            Issue
          </button>
        </form>

        <form
          onSubmit={requestBookFromAdmin}
          className="rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BookMarked className="h-5 w-5 text-emerald-600" />
            Request New Book
          </h2>
          <input
            className="w-full rounded-xl border border-slate-200 p-2.5"
            placeholder="Book title"
            value={requestForm.title}
            onChange={(e) =>
              setRequestForm({ ...requestForm, title: e.target.value })
            }
          />
          <input
            className="w-full rounded-xl border border-slate-200 p-2.5"
            placeholder="Author"
            value={requestForm.author}
            onChange={(e) =>
              setRequestForm({ ...requestForm, author: e.target.value })
            }
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 p-2.5"
            placeholder="Message"
            value={requestForm.message}
            onChange={(e) =>
              setRequestForm({ ...requestForm, message: e.target.value })
            }
          />
          <button className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white">
            Send Request
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <BellRing className="h-5 w-5 text-blue-600" />
            Student Issue Requests ({issueRequests.length})
          </h2>
          {issueRequests.map((req) => (
            <div
              key={req.id}
              className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 p-3"
            >
              <div>
                <p className="font-medium">
                  {req.student_name} requested: {req.title}
                </p>
                <p className="text-sm text-slate-600">
                  Category: {req.category || "General"} | University ID: {req.university_id || "-"} | Author:{" "}
                  {req.author}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveIssueRequest(req.id)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white"
                >
                  Approve & Issue
                </button>
                <button
                  onClick={() => rejectIssueRequest(req.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            Issued / Returned Tracking
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Book</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Issue Date</th>
                  <th className="px-3 py-2">Due Date</th>
                  <th className="px-3 py-2">Penalty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{item.student_name}</td>
                    <td className="px-3 py-2">{item.book_name}</td>
                    <td className="px-3 py-2">{item.category || "General"}</td>
                    <td className="px-3 py-2">{item.issue_date}</td>
                    <td className="px-3 py-2">{item.due_date}</td>
                    <td className="px-3 py-2">
                      Rs{" "}
                      {item.status === "issued"
                        ? item.live_penalty
                        : item.penalty}
                    </td>
                    <td className="px-3 py-2 capitalize">{item.status}</td>
                    <td className="px-3 py-2">
                      {item.status === "issued" ? (
                        <button
                          onClick={() => returnBook(item.id)}
                          className="rounded-lg bg-orange-600 px-3 py-1.5 text-white"
                        >
                          Return
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <RefreshCcw className="h-5 w-5 text-purple-600" />
            Pending Reissue Requests
          </h2>
          {reissueRequests.map((req) => (
            <div
              key={req.id}
              className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 p-3"
            >
              <div>
                <p className="font-medium">
                  {req.title} - {req.student_name}
                </p>
                <p className="text-sm text-slate-600">
                  Category: {req.category || "General"} | Current due: {req.due_date}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveReissue(req.id)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white"
                >
                  Approve +15 days
                </button>
                <button
                  onClick={() => rejectReissue(req.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
