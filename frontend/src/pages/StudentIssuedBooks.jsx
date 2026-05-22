import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  RefreshCcw,
  RotateCcw,
  SearchIcon,
  X,
} from "lucide-react";
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

export default function StudentIssuedBooks() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issues, setIssues] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [reissueRequests, setReissueRequests] = useState([]);
  const [processing, setProcessing] = useState("");
  const [returnMessageModal, setReturnMessageModal] = useState(null);
  const [returnMessage, setReturnMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("member");

  const load = async () => {
    const [issueData, returnData, reissueData] = await Promise.all([
      apiFetch("student/issues"),
      apiFetch("student/return-requests"),
      apiFetch("student/reissue-requests"),
    ]);
    setIssues(issueData.issues || []);
    setReturnRequests(returnData.return_requests || []);
    setReissueRequests(reissueData.reissue_requests || []);
  };

  useEffect(() => {
    let active = true;
    const boot = async () => {
      try {
        await load();
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
    boot();
    return () => {
      active = false;
    };
  }, []);

  const returnMap = useMemo(
    () =>
      Object.fromEntries(
        returnRequests.map((item) => [item.issue_id, item.status]),
      ),
    [returnRequests],
  );

  const reissueMap = useMemo(
    () =>
      Object.fromEntries(
        reissueRequests.map((item) => [item.issue_id, item.status]),
      ),
    [reissueRequests],
  );

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();
    return issues.filter((book) =>
      query
        ? `${book.title} ${book.book_name} ${book.author} ${book.category}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [issues, search]);

  const requestReissue = async (issueId) => {
    setProcessing(`reissue-${issueId}`);
    try {
      await apiFetch("student/reissue-request", {
        method: "POST",
        body: JSON.stringify({ issue_id: issueId }),
      });
      toast.success("Reissue request placed");
      await load();
      window.dispatchEvent(new Event("student-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing("");
    }
  };

  const requestReturn = async (issueId) => {
    setReturnMessageModal({ issueId });
  };

  const confirmReturn = async () => {
    const issueId = returnMessageModal.issueId;
    setProcessing(`return-${issueId}`);
    try {
      const result = await apiFetch("student/return-request", {
        method: "POST",
        body: JSON.stringify({ issue_id: issueId }),
      });

      if (returnMessage.trim()) {
        const returnRequestId = result.return_request_id;
        if (returnRequestId) {
          await apiFetch("student/return-message", {
            method: "POST",
            body: JSON.stringify({
              return_request_id: returnRequestId,
              message: returnMessage.trim(),
              recipient: selectedRecipient,
            }),
          });
        }
      }

      toast.success("Return request sent");
      setReturnMessageModal(null);
      setReturnMessage("");
      setSelectedRecipient("member");
      await load();
      window.dispatchEvent(new Event("student-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing("");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Issued Collection
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
              My Issued Books
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track due dates, request reissue, and submit return requests.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 lg:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find your books"
              className="border-0 bg-transparent px-0"
            />
          </div>
        </div>
      </section>

      {filteredIssues.length === 0 ? (
        <section className="card p-8 text-center text-sm text-slate-500">
          No issued books found.
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredIssues.map((book) => {
            const liveReturnStatus = returnMap[book.id];
            const liveReissueStatus = reissueMap[book.id];
            const isIssued = book.status === "issued";

            return (
              <article key={book.id} className="card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {book.title || book.book_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{book.author}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {book.category || "General"}
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      isIssued ? "badge-warning" : "badge-success"
                    } capitalize`}
                  >
                    {book.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Issue Date
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatDate(book.issue_date)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Due Date
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatDate(book.due_date)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {liveReturnStatus ? (
                    <span className="badge badge-warning capitalize">
                      Return request: {liveReturnStatus}
                    </span>
                  ) : null}
                  {liveReissueStatus ? (
                    <span className="badge badge-warning capitalize">
                      Reissue request: {liveReissueStatus}
                    </span>
                  ) : null}
                  {!liveReturnStatus && !liveReissueStatus ? (
                    <span className="badge badge-success">
                      No pending action
                    </span>
                  ) : null}
                </div>

                {isIssued ? (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      disabled={
                        liveReissueStatus === "pending" ||
                        processing === `reissue-${book.id}`
                      }
                      onClick={() => requestReissue(book.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      {processing === `reissue-${book.id}`
                        ? "Sending..."
                        : liveReissueStatus === "pending"
                          ? "Reissue Pending"
                          : "Reissue Book"}
                    </button>
                    <button
                      disabled={
                        liveReturnStatus === "pending" ||
                        processing === `return-${book.id}`
                      }
                      onClick={() => requestReturn(book.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {processing === `return-${book.id}`
                        ? "Sending..."
                        : liveReturnStatus === "pending"
                          ? "Return Pending"
                          : "Request Return"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CalendarClock className="h-4 w-4" />
                    Returned on {formatDate(book.return_date)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {returnMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="card w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Request Return
              </h3>
              <button
                onClick={() => {
                  setReturnMessageModal(null);
                  setReturnMessage("");
                  setSelectedRecipient("member");
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Send a message (optional):
              </label>
              <textarea
                value={returnMessage}
                onChange={(e) => setReturnMessage(e.target.value)}
                placeholder="Add any message for the member/admin..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {returnMessage.trim() && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Send message to:
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setReturnMessageModal(null);
                  setReturnMessage("");
                  setSelectedRecipient("member");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                disabled={processing.startsWith("return-")}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {processing.startsWith("return-")
                  ? "Sending..."
                  : "Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
