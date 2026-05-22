import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, BookOpenText, CalendarClock, Clock3, IndianRupee, Send } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { apiFetch } from "../api";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    books: [],
    issues: [],
    issueRequests: [],
    returnRequests: [],
    reissueRequests: [],
  });
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [booksData, issuesData, issueReqData, returnReqData, reissueReqData] =
          await Promise.all([
            apiFetch("books"),
            apiFetch("student/issues"),
            apiFetch("student/issue-requests"),
            apiFetch("student/return-requests"),
            apiFetch("student/reissue-requests"),
          ]);
        if (!active) return;
        setData({
          books: booksData.books || [],
          issues: issuesData.issues || [],
          issueRequests: issueReqData.requests || [],
          returnRequests: returnReqData.return_requests || [],
          reissueRequests: reissueReqData.reissue_requests || [],
        });
      } catch (err) {
        if (active) {
          toast.error(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const activeIssues = data.issues.filter((item) => item.status === "issued");
    const pendingIssueRequests = data.issueRequests.filter((item) => item.status === "pending");
    const totalPenalty = activeIssues.reduce((sum, item) => {
      const dueDate = new Date(item.due_date);
      const lateDays = Math.max(
        0,
        Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      );
      return sum + lateDays * 5;
    }, 0);

    const activity = [
      ...data.issueRequests.map((item) => ({
        id: `issue-request-${item.id}`,
        activity: "Issue Request",
        category: item.category || "General",
        description: `${item.title || item.book_name} request is ${item.status}`,
        date: item.requested_at,
      })),
      ...data.returnRequests.map((item) => ({
        id: `return-request-${item.id}`,
        activity: "Return Request",
        category: item.category || "General",
        description: `${item.title || item.book_name} return request is ${item.status}`,
        date: item.requested_at,
      })),
      ...data.reissueRequests.map((item) => ({
        id: `reissue-request-${item.id}`,
        activity: "Reissue Request",
        category: item.category || "General",
        description: `${item.title || item.book_name} reissue request is ${item.status}`,
        date: item.requested_at,
      })),
      ...data.issues.map((item) => ({
        id: `issue-${item.id}`,
        activity: item.status === "issued" ? "Book Issued" : "Book Returned",
        category: item.category || "General",
        description: `${item.title || item.book_name} due on ${formatDate(item.due_date)}`,
        date: item.return_date || item.issue_date,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    return {
      activeIssues,
      pendingIssueRequests,
      totalPenalty,
      activity,
    };
  }, [data]);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <section className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
          Welcome Back
        </p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
          {user?.name || "Student"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {user?.department || "Department not added yet"} {" · "} Keep track of your issued books and request status from one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card card-hover relative overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-indigo-500" />
          <p className="text-sm font-medium text-slate-500">Issued Books</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.activeIssues.length}
          </p>
          <CalendarClock className="mt-4 h-10 w-10 rounded-2xl bg-indigo-50 p-2.5 text-indigo-600" />
        </div>
        <div className="card card-hover relative overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-amber-500" />
          <p className="text-sm font-medium text-slate-500">Pending Requests</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.pendingIssueRequests.length}
          </p>
          <Send className="mt-4 h-10 w-10 rounded-2xl bg-amber-50 p-2.5 text-amber-600" />
        </div>
        <div className="card card-hover relative overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-rose-500" />
          <p className="text-sm font-medium text-slate-500">Live Penalty</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            Rs {summary.totalPenalty}
          </p>
          <IndianRupee className="mt-4 h-10 w-10 rounded-2xl bg-rose-50 p-2.5 text-rose-600" />
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/student/books"
          className="btn-primary inline-flex items-center justify-center gap-2 text-center"
        >
          Browse Books
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          to="/student/issued-books"
          className="btn-secondary inline-flex items-center justify-center gap-2 text-center"
        >
          View Issued History
          <Clock3 className="h-4 w-4" />
        </Link>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Latest updates from your issue, return, and reissue flow.
          </p>
        </div>
        {summary.activity.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No activity found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.activity.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-slate-900">{item.activity}</td>
                    <td>{item.category}</td>
                    <td>{item.description}</td>
                    <td>{formatDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
