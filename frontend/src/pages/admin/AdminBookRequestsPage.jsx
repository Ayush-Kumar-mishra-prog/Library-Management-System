import { useEffect, useState } from "react";
import { Eye, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function AdminBookRequestsPage() {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      const data = await apiFetch("admin/book-requests");
      setRequests(data.requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    try {
      await apiFetch("admin/book-requests/update-status", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId, status })
      });
      toast.success("Request status updated");
      load();
      window.dispatchEvent(new Event("admin-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pendingRequests = requests.filter((req) => req.status === "pending");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Eye className="h-5 w-5 text-orange-600" />
          Member Book Requests ({pendingRequests.length})
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Admin can approve/ close pending requests from here.
        </p>
      </div>

      <div className="space-y-2">
        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            No pending request at this time
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/50">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">{req.title || "Requested Book"} - {req.author || "Unknown"}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{req.message}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">By {req.member_name} ({req.member_username}) | Status: {req.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateRequestStatus(req.id, "seen")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600">
                  Seen
                </button>
                <button
                  onClick={() => updateRequestStatus(req.id, "closed")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-500/40 dark:bg-red-500/10"
                  title="Close request"
                >
                  <XCircle className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
