import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  RefreshCcw,
  Search,
  Clock3,
  BadgeIndianRupee,
  Library,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, toPublicFileUrl } from "../api";
import { student } from "../assets/assets";
import DashboardShell from "../components/DashboardShell";

export default function StudentPage() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [issueRequests, setIssueRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const [b, i, r, rr] = await Promise.all([
        apiFetch("books"),
        apiFetch("student/issues"),
        apiFetch("student/issue-requests"),
        apiFetch("student/return-requests"),
      ]);
      setBooks(b.books || []);
      setIssues(i.issues || []);
      setIssueRequests(r.requests || []);
      setReturnRequests(rr.return_requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reissueRequest = async (issueId) => {
    try {
      await apiFetch("student/reissue-request", {
        method: "POST",
        body: JSON.stringify({ issue_id: issueId }),
      });
      toast.success("Reissue request sent");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const applyForIssue = async (bookId) => {
    try {
      await apiFetch("student/issue-request", {
        method: "POST",
        body: JSON.stringify({ book_id: bookId }),
      });
      toast.success("Issue request sent to member");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const requestReturn = async (issueId) => {
    try {
      await apiFetch("student/return-request", {
        method: "POST",
        body: JSON.stringify({ issue_id: issueId }),
      });
      toast.success("Return request sent to member");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredBooks = books.filter((b) =>
    `${b.book_name} ${b.author} ${b.title}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const booksByCategory = filteredBooks.reduce((acc, book) => {
    const cat = book.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(book);
    return acc;
  }, {});
  const activeIssues = issues.filter((i) => i.status === "issued");
  const returnRequestMap = Object.fromEntries(
    returnRequests.map((req) => [req.issue_id, req.status]),
  );
  const totalLivePenalty = activeIssues.reduce((sum, i) => {
    const due = new Date(i.due_date);
    const today = new Date();
    const lateDays = Math.max(
      0,
      Math.floor((today - due) / (1000 * 60 * 60 * 24)),
    );
    return sum + lateDays * 5;
  }, 0);
  const nextDue = activeIssues.map((i) => i.due_date).sort()[0];

  return (
    <DashboardShell
      title="Student Dashboard"
      subtitle="Check available books, due dates, and submit reissue requests"
      bannerImage={student}
      icon={GraduationCap}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Available books</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Library className="h-5 w-5 text-blue-600" />
            {books.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Currently issued</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Clock3 className="h-5 w-5 text-emerald-600" />
            {activeIssues.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Live penalty (today)</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
            <BadgeIndianRupee className="h-5 w-5 text-rose-600" />
            {totalLivePenalty}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm bg-white">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Book Information
          </h2>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full border-0 py-2.5 outline-none"
              placeholder="Search books by name/author"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[420px] overflow-auto pr-1">
            {Object.keys(booksByCategory).map((category) => (
              <div key={category} className="mb-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  {category}
                </h3>
                <table className="min-w-full rounded-lg border border-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Image</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Author</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Available</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booksByCategory[category].map((book) => (
                      <tr key={book.id} className="border-t border-slate-200">
                        <td className="px-3 py-2">
                          <img
                            src={
                              book.image_url
                                ? toPublicFileUrl(book.image_url)
                                : student
                            }
                            alt={book.book_name}
                            className="h-12 w-8 rounded object-cover"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {book.book_name}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {book.author}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {book.category || "General"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-xs font-semibold ${
                              book.available_qty > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {book.available_qty > 0
                              ? `${book.available_qty} / ${book.total_qty}`
                              : `0/${book.total_qty}`}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            disabled={book.available_qty < 1}
                            onClick={() => applyForIssue(book.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {book.available_qty < 1 ? "Not Available" : "Apply"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {filteredBooks.length === 0 && (
              <p className="text-sm text-slate-500">No books found.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm bg-white">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="h-5 w-5 text-emerald-600" />
            My Ordered / Issued Books
          </h2>
          {nextDue && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Nearest due date: <span className="font-semibold">{nextDue}</span>
            </p>
          )}
          <div className="max-h-[420px] overflow-auto pr-1">
            {issues.map((item) => {
              const due = new Date(item.due_date);
              const today = new Date();
              const lateDays = Math.max(
                0,
                Math.floor((today - due) / (1000 * 60 * 60 * 24)),
              );
              const livePenalty =
                item.status === "issued" ? lateDays * 5 : item.penalty;
              return (
                <div
                  key={item.id}
                  className="mb-2 rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        Category: {item.category || "General"}
                      </p>
                      <p className="text-sm text-slate-600">
                        Issue: {item.issue_date} | Due: {item.due_date}
                      </p>
                      <p className="text-xs text-slate-500">
                        Penalty: Rs {livePenalty}{" "}
                        {lateDays > 0 ? `(Late by ${lateDays} days)` : ""}
                      </p>
                    </div>
                    {item.status === "issued" && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => reissueRequest(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-white"
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Reissue
                        </button>
                        <button
                          onClick={() => requestReturn(item.id)}
                          disabled={returnRequestMap[item.id] === "pending"}
                          className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {returnRequestMap[item.id] === "pending"
                            ? "Return Requested"
                            : "Request Return"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {issues.length === 0 && (
              <p className="text-sm text-slate-500">No issued books yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">
          My Issue Requests
        </h3>
        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {issueRequests.slice(0, 6).map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-slate-200 p-3 text-sm"
            >
              <p className="font-semibold text-slate-800">{req.title}</p>
              <p className="text-xs text-slate-500">
                Category: {req.category || "General"}
              </p>
              <p className="text-xs text-slate-600">
                Status: <span className="capitalize">{req.status}</span>
              </p>
              <p className="text-xs text-slate-500">
                Requested: {req.requested_at}
              </p>
            </div>
          ))}
          {issueRequests.length === 0 && (
            <p className="text-sm text-slate-500">No issue requests yet.</p>
          )}
        </div>

        <h3 className="mb-2 text-lg font-semibold text-slate-800">
          My Return Requests
        </h3>
        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {returnRequests.slice(0, 6).map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-slate-200 p-3 text-sm"
            >
              <p className="font-semibold text-slate-800">
                {req.title || req.book_name}
              </p>
              <p className="text-xs text-slate-500">
                Category: {req.category || "General"}
              </p>
              <p className="text-xs text-slate-600">
                Status: <span className="capitalize">{req.status}</span>
              </p>
              <p className="text-xs text-slate-500">
                Requested: {req.requested_at}
              </p>
              <p className="text-xs text-slate-500">Due: {req.due_date}</p>
            </div>
          ))}
          {returnRequests.length === 0 && (
            <p className="text-sm text-slate-500">No return requests yet.</p>
          )}
        </div>

        <h3 className="mb-2 text-lg font-semibold text-slate-800">
          Student Portal Quick Guide
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-fuchsia-600 p-3 text-sm text-slate-600">
            1.Student can issue and reissue any book by the Members of Library
            at any time if book is available .
          </div>
          <div className="rounded-xl border border-fuchsia-600 p-3 text-sm text-slate-600">
            2. Every issue is default for 15 days. After due date Rs 5/day will
            be charged
          </div>
          <div className="rounded-xl border border-fuchsia-600 p-3 text-sm text-slate-600">
            3. Delay will be avoided if you reissue the book before the due
            date.
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
