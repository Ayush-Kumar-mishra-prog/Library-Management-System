import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function MemberReturnRequestsPage() {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      const data = await apiFetch("member/return-requests");
      setRequests(data.requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveReturnRequest = async (requestId) => {
    try {
      const data = await apiFetch("member/return-request-approve", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId }),
      });
      toast.success(data.message || "Return approved");
      load();
      window.dispatchEvent(new Event("member-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rejectReturnRequest = async (requestId) => {
    try {
      await apiFetch("member/return-request-reject", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId }),
      });
      toast.success("Return request rejected");
      load();
      window.dispatchEvent(new Event("member-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <ClipboardList className="h-5 w-5 text-indigo-600" />
        Pending Return Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No pending return requests at the moment.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {req.student_name} wants to return
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {req.title || req.book_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Category: {req.category || "General"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    University ID: {req.university_id || "-"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Issue date: {req.issue_date} | Due date: {req.due_date}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => approveReturnRequest(req.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Return
                  </button>
                  <button
                    onClick={() => rejectReturnRequest(req.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
