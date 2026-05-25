import { useEffect, useMemo, useState } from "react";
import { BellIcon, SearchIcon, Trash2 } from "lucide-react";
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

export default function PortalNotificationsPage({ role }) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await apiFetch(`${role}/notifications`);
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
  }, [role]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notifications.filter((item) =>
      query
        ? `${item.title} ${item.message} ${item.sender_name || ""} ${item.sender_role} ${item.type}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [notifications, search]);

  const handleMarkSeen = async (notificationId) => {
    try {
      await apiFetch(`${role}/mark-notification-seen`, {
        method: "POST",
        body: JSON.stringify({ notification_id: notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, seen: true } : n)),
      );
      window.dispatchEvent(new Event(`${role}-badge-refresh`));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      await apiFetch(`${role}/delete-notification`, {
        method: "POST",
        body: JSON.stringify({ notification_id: notificationId }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      window.dispatchEvent(new Event(`${role}-badge-refresh`));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.message);
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
              Received Messages
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Student replies and direct messages will appear here.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 lg:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages"
              className="border-0 bg-transparent px-0"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">
            No messages available.
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
                    <span>
                      Sent by: {notification.sender_name || notification.sender_role}
                    </span>
                    <span>Role: {notification.sender_role}</span>
                    <span>Date: {formatDate(notification.created_at)}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!notification.seen && (
                      <button
                        onClick={() => handleMarkSeen(notification.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Mark as Seen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
