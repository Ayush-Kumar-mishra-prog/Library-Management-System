import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function MemberStudentRequestsPage() {
  const [issueRequests, setIssueRequests] = useState([]);

  const load = async () => {
    try {
      const data = await apiFetch("member/issue-requests");
      setIssueRequests(data.requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      window.dispatchEvent(new Event("member-badge-refresh"));
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
      window.dispatchEvent(new Event("member-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <BellRing className="h-5 w-5 text-blue-600" />
        Student Issue Requests ({issueRequests.length})
      </h2>
      {issueRequests.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No pending student requests.
        </p>
      ) : (
        issueRequests.map((req) => (
          <div
            key={req.id}
            className="mb-2 flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"
          >
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {req.student_name} requested: {req.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Category: {req.category || "General"} | University ID: {req.university_id || "-"} | Author: {req.author}
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
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-600 dark:border-red-500/40 dark:bg-red-500/10"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
