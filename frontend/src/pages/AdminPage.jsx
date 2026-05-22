import { useEffect, useState } from "react";
import { BookPlus, Eye, ImagePlus, KeyRound, Shield, Trash2, UserPlus, Users, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, apiUpload, toPublicFileUrl } from "../api";
import { admin } from "../assets/assets";
import DashboardShell from "../components/DashboardShell";
import { Link } from "react-router-dom";
import { BOOK_CATEGORIES } from "../constants/bookCategories";

export default function AdminPage() {
  const [book, setBook] = useState({
    book_uid: "",
    book_number: "",
    book_name: "",
    title: "",
    description: "",
    author: "",
    publish_date: "",
    image_url: "",
    total_qty: 1,
    category: BOOK_CATEGORIES[0]
  });
  const [member, setMember] = useState({
    name: "",
    university_id: "",
    position: "",
    faculty: "",
    department: "",
    batch: "",
    contact: "",
    email: "",
    username: "",
    password: ""
  });
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [bookImageFile, setBookImageFile] = useState(null);
  const pendingRequests = requests.filter((req) => req.status === "pending");

  const loadAdminData = async () => {
    try {
      const [memberData, requestData, credentialData] = await Promise.all([
        apiFetch("admin/members"),
        apiFetch("admin/book-requests"),
        apiFetch("admin/member-credentials")
      ]);
      setMembers(memberData.members || []);
      setRequests(requestData.requests || []);
      setCredentials(credentialData.credentials || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const addBook = async (e) => {
    e.preventDefault();
    try {
      if (!bookImageFile) {
        toast.error("Please select a book image file");
        return;
      }
      const formData = new FormData();
      formData.append("image", bookImageFile);
      const upload = await apiUpload("admin/upload-book-image", formData);
      const payload = { ...book, image_url: toPublicFileUrl(upload.path) };
      await apiFetch("admin/books", { method: "POST", body: JSON.stringify(payload) });
      toast.success("Book added successfully");
      setBook({
        book_uid: "",
        book_number: "",
        book_name: "",
        title: "",
        description: "",
        author: "",
        publish_date: "",
        image_url: "",
        total_qty: 1,
        category: BOOK_CATEGORIES[0]
      });
      setBookImageFile(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const createMember = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("admin/members", { method: "POST", body: JSON.stringify(member) });
      toast.success("Member created successfully");
      setMember({
        name: "",
        university_id: "",
        position: "",
        faculty: "",
        department: "",
        batch: "",
        contact: "",
        email: "",
        username: "",
        password: ""
      });
      loadAdminData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await apiFetch("admin/book-requests/update-status", {
        method: "POST",
        body: JSON.stringify({ request_id: requestId, status })
      });
      toast.success("Request status updated");
      loadAdminData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await apiFetch("admin/members/delete", {
        method: "POST",
        body: JSON.stringify({ member_id: memberId })
      });
      toast.success("Member removed");
      loadAdminData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Manage books and create library members"
      bannerImage={admin}
      icon={Shield}
    >
      <div className="mb-4">
        <Link to="/admin/members" className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
          Open Members Management Page
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addBook} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <BookPlus className="h-5 w-5 text-blue-600" />
            Add New Book
          </h2>
          {Object.keys(book).filter((key) => key !== "image_url" && key !== "category").map((key) => (
            <input
              key={key}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder={key.replaceAll("_", " ")}
              type={key === "publish_date" ? "date" : key === "total_qty" ? "number" : "text"}
              value={book[key]}
              onChange={(e) => setBook({ ...book, [key]: e.target.value })}
            />
          ))}
          <select
            className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            value={book.category}
            onChange={(e) => setBook({ ...book, category: e.target.value })}
          >
            {BOOK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <label className="block">
            <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
              <ImagePlus className="h-4 w-4" />
              Book image file
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
              onChange={(e) => setBookImageFile(e.target.files?.[0] || null)}
            />
          </label>
          <button className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
            Save Book
          </button>
        </form>

        <form onSubmit={createMember} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Create Member
          </h2>
          {Object.keys(member).map((key) => (
            <input
              key={key}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder={key.replaceAll("_", " ")}
              type={key === "password" ? "password" : "text"}
              value={member[key]}
              onChange={(e) => setMember({ ...member, [key]: e.target.value })}
            />
          ))}
          <button className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700">
            Create Member
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Users className="h-5 w-5 text-indigo-600" />
            Members ({members.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {members.slice(0, 8).map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-600">{m.username} | {m.email}</p>
                    <p className="text-xs text-slate-500">{m.department || "-"} / {m.batch || "-"}</p>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <KeyRound className="h-5 w-5 text-cyan-600" />
            Member Credentials
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Contact</th>
                </tr>
              </thead>
              <tbody>
                {credentials.slice(0, 12).map((c) => (
                  <tr key={c.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">{c.username}</td>
                    <td className="px-3 py-2">{c.email}</td>
                    <td className="px-3 py-2">{c.contact || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">Password security ke liye plain password show nahi kiya jata.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Eye className="h-5 w-5 text-orange-600" />
            Member Book Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-2">
            {pendingRequests.slice(0, 10).map((req) => (
              <div key={req.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-800">{req.title || "Requested Book"} - {req.author || "Unknown"}</p>
                  <p className="text-xs text-slate-600">{req.message}</p>
                  <p className="text-xs text-slate-500">By {req.member_name} ({req.member_username}) | Status: {req.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateRequestStatus(req.id, "seen")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs">Seen</button>
                  <button
                    onClick={() => updateRequestStatus(req.id, "closed")}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                    title="Close request"
                  >
                    <XCircle className="h-4 w-4" />
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
