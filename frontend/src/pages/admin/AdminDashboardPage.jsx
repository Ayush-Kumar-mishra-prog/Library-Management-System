import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookPlus, Eye, KeyRound, Users, UserPlus, CalendarClock, Users2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function AdminDashboardPage() {
  const [members, setMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      const [memberData, studentData, requestData] = await Promise.all([
        apiFetch("admin/members"),
        apiFetch("admin/students"),
        apiFetch("admin/book-requests"),
      ]);
      setMembers(memberData.members || []);
      setStudents(studentData.students || []);
      setRequests(requestData.requests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pending = requests.filter((r) => r.status === "pending").length;

  const cards = [
    { to: "/admin/add-book", label: "Add Book", desc: "Nayi book register karo", icon: BookPlus, color: "from-blue-500 to-indigo-600" },
    { to: "/admin/create-member", label: "Create Member", desc: "Library staff add karo", icon: UserPlus, color: "from-emerald-500 to-teal-600" },
    { to: "/admin/members", label: "Members", desc: "Search, edit, remove", icon: Users, color: "from-violet-500 to-purple-600" },
    { to: "/admin/students", label: "Students", desc: `Registered: ${students.length}`, icon: Users, color: "from-slate-600 to-slate-800" },
    { to: "/admin/member-credentials", label: "Credentials", desc: "Username / email list", icon: KeyRound, color: "from-cyan-500 to-blue-600" },
    { to: "/admin/book-requests", label: "Book Requests", desc: `Pending: ${pending}`, icon: Eye, color: "from-orange-500 to-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
          Welcome Back 
        </p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
          Admin
        </h2>
        {/* <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Overview</h2> */}
        <p className="mt-2 text-sm text-slate-600">
           Keep track of your issued books,Members,students and request status from one place.
        </p>
        {/* <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Total members: <span className="font-bold text-slate-800 dark:text-slate-200">{members.length}</span>
          {" · "}
          Students: <span className="font-bold text-slate-800 dark:text-slate-200">{students.length}</span>
          {" · "}
          Book requests: <span className="font-bold text-slate-800 dark:text-slate-200">{requests.length}</span>
          {" · "}
          Pending requests: <span className="font-bold text-amber-700 dark:text-amber-400">{pending}</span>
        </p> */}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card card-hover relative overflow-hidden p-5">
        <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-indigo-500" />
          <p className="text-sm font-medium text-slate-500">Total Members</p>
           <p className="mt-2 text-3xl font-bold text-slate-900">
            {members.length}
          </p>
                    <CalendarClock className="mt-4 h-10 w-10 rounded-2xl bg-indigo-50 p-2.5 text-indigo-600" />
</div>
  <div className="card card-hover relative overflow-hidden p-5">
        <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-indigo-500" />
          <p className="text-sm font-medium text-slate-500">Total Students</p>
           <p className="mt-2 text-3xl font-bold text-slate-900">
            {students.length}
          </p>
                    <Users2Icon className="mt-4 h-10 w-10 rounded-2xl bg-indigo-50 p-2.5 text-indigo-600" />
</div>
 <div className="card card-hover relative overflow-hidden p-5">
        <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-indigo-500" />
          <p className="text-sm font-medium text-slate-500">Total Requests</p>
           <p className="mt-2 text-3xl font-bold text-slate-900">
            {requests.length}
          </p>
                    <Eye className="mt-4 h-10 w-10 rounded-2xl bg-indigo-50 p-2.5 text-indigo-600" />
</div>


      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="soft-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/50"
          >
            <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${c.color} p-2.5 text-white`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-100">{c.label}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
