import { useEffect, useMemo, useState } from "react";
import { BellIcon, SearchIcon, X } from "lucide-react";
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

export default function NotificationStudent() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await apiFetch("student/notifications");
        if (!active) return;
        setNotifications(data.notifications || []);
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

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notifications.filter((item) =>
      query
        ? `${item.title} ${item.message} ${item.sender_role} ${item.type}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [notifications, search]);

  const handleMarkSeen = async (notificationId) => {
    try {
      await apiFetch("student/mark-notification-seen", {
        method: "POST",
        body: JSON.stringify({ notification_id: notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, seen: true } : n)),
      );
      window.dispatchEvent(new Event("student-badge-refresh"));
    } catch (err) {
      console.error("Failed to mark as seen:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      let recipient = messageModal.sender_role;
      if (!["member", "admin"].includes(recipient)) {
        recipient = "admin";
      }

      await apiFetch("student/return-message", {
        method: "POST",
        body: JSON.stringify({
          return_request_id: messageModal.return_request_id || 0,
          message: messageText.trim(),
          recipient: recipient,
        }),
      });
      toast.success("Message sent successfully");
      handleMarkSeen(messageModal.id);
      setMessageModal(null);
      setMessageText("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Notification Center
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
              Notification Panel
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Member approvals, rejections, admin/member messages, and return
              updates yahan dikhenge.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 lg:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications"
              className="border-0 bg-transparent px-0"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">
            No notifications available.
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`card p-5 ${!notification.seen ? "border-l-4 border-l-red-500" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-2xl p-3 ${
                    !notification.seen
                      ? "bg-red-50 text-red-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <BellIcon className="h-5 w-5" />
                  {!notification.seen && (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      •
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {notification.title}
                    </h3>
                    <span
                      className={`badge ${
                        !notification.seen ? "badge-error" : "badge-warning"
                      } capitalize`}
                    >
                      {notification.seen ? "Seen" : "Unseen"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Sent by: {notification.sender_role}</span>
                    <span>Date: {formatDate(notification.created_at)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMessageModal({
                        id: notification.id,
                        return_request_id: notification.related_id || 0,
                        sender_role: notification.sender_role,
                        sender_name:
                          notification.sender_name || notification.sender_role,
                      });
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Send Reply Message
                  </button>
                  {!notification.seen && (
                    <button
                      onClick={() => handleMarkSeen(notification.id)}
                      className="ml-2 mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Mark as Seen
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="card w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Send Reply to {messageModal.sender_name}
              </h3>
              <button
                onClick={() => {
                  setMessageModal(null);
                  setMessageText("");
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Replying to:</span>{" "}
                {messageModal.sender_name} ({messageModal.sender_role})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message:
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message"
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setMessageModal(null);
                  setMessageText("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
