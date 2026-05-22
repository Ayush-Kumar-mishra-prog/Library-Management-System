import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../api";

const PAGE_SIZE = 8;

export default function MembersManagementPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    member_id: "",
    name: "",
    position: "",
    faculty: "",
    department: "",
    batch: "",
    contact: "",
    email: "",
    username: ""
  });

  const loadMembers = async () => {
    try {
      const data = await apiFetch("admin/members");
      setMembers(data.members || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q)
    );
  }, [members, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openEdit = (member) => {
    setEditing(member.id);
    setEditForm({
      member_id: member.id,
      name: member.name || "",
      position: member.position || "",
      faculty: member.faculty || "",
      department: member.department || "",
      batch: member.batch || "",
      contact: member.contact || "",
      email: member.email || "",
      username: member.username || ""
    });
  };

  const saveEdit = async () => {
    try {
      await apiFetch("admin/members/update", {
        method: "POST",
        body: JSON.stringify(editForm)
      });
      toast.success("Member updated");
      setEditing(null);
      loadMembers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeMember = async (id) => {
    try {
      await apiFetch("admin/members/delete", {
        method: "POST",
        body: JSON.stringify({ member_id: id })
      });
      toast.success("Member removed");
      loadMembers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Members Management</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Search, edit, and remove members</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 dark:border-slate-600">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-64 border-0 bg-transparent py-2.5 outline-none"
              placeholder="Search name, username, email, department"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Batch</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
            {pageData.map((m) => (
              <tr key={m.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">{m.name}</td>
                  <td className="px-3 py-2">{m.username}</td>
                  <td className="px-3 py-2">{m.email}</td>
                  <td className="px-3 py-2">{m.department || "-"}</td>
                  <td className="px-3 py-2">{m.batch || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button onClick={() => removeMember(m.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50 dark:border-slate-600">
            Prev
          </button>
          <span className="rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700">{page}/{totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50 dark:border-slate-600">
            Next
          </button>
        </div>
      </div>

      {editing && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Edit Member</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.keys(editForm).filter((k) => k !== "member_id").map((key) => (
              <input
                key={key}
                className="rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-600"
                placeholder={key.replaceAll("_", " ")}
                value={editForm[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
              />
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={saveEdit} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
