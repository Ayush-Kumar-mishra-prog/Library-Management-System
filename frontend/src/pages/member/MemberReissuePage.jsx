import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function MemberReissuePage() {
  const [reissueRequests, setReissueRequests] = useState([]);

  const load = async () => {
    try {
      const data = await apiFetch("member/reissue-requests");
      setReissueRequests(data.requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveReissue = async (requestId) => {
    try {
      await apiFetch("member/reissue-approve", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId, extra_days: 15 })
      });
      toast.success("Reissue approved");
      load();
      window.dispatchEvent(new Event("member-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rejectReissue = async (requestId) => {
    try {
      await apiFetch("member/reissue-reject", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId })
      });
      toast.success("Reissue rejected");
      load();
      window.dispatchEvent(new Event("member-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <RefreshCcw className="h-5 w-5 text-purple-600" />
        Pending Reissue Requests
      </h2>
      {reissueRequests.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No reissue requests right now.</p>
      ) : (
        reissueRequests.map((req) => (
          <div key={req.id} className="mb-2 flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">{req.title} - {req.student_name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Category: {req.category || "General"} | Current due: {req.due_date}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveReissue(req.id)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white">Approve +15 days</button>
              <button onClick={() => rejectReissue(req.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-600 dark:border-red-500/40 dark:bg-red-500/10">Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
