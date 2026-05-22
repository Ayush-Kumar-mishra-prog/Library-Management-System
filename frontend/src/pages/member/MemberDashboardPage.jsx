import { useEffect, useState } from "react";
import {
  BellRing,
  BookMarked,
  BookPlus,
  ClipboardList,
  LayoutDashboard,
  RefreshCcw,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function MemberDashboardPage() {
  const [stats, setStats] = useState({
    issues: 0,
    issueRequests: 0,
    reissueRequests: 0,
    returnRequests: 0,
  });

  const load = async () => {
    try {
      const [issuesData, issueReqData, reissueData, returnReqData] =
        await Promise.all([
          apiFetch("member/issues"),
          apiFetch("member/issue-requests"),
          apiFetch("member/reissue-requests"),
          apiFetch("member/return-requests"),
        ]);
      setStats({
        issues: issuesData.issues?.length || 0,
        issueRequests: issueReqData.requests?.length || 0,
        reissueRequests: reissueData.requests?.length || 0,
        returnRequests: returnReqData.requests?.length || 0,
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    {
      to: "/member/issue-book",
      label: "Issue Book",
      desc: "Student ko book issue karo",
      icon: BookPlus,
      color: "from-blue-500 to-indigo-600",
    },
    {
      to: "/member/request-book",
      label: "Request Book",
      desc: "Admin ko new book request",
      icon: BookMarked,
      color: "from-emerald-500 to-teal-600",
    },
    {
      to: "/member/student-requests",
      label: "Student Requests",
      desc: `Pending: ${stats.issueRequests}`,
      icon: BellRing,
      color: "from-amber-500 to-orange-600",
    },
    {
      to: "/member/return-requests",
      label: "Return Requests",
      desc: `Pending: ${stats.returnRequests}`,
      icon: ClipboardList,
      color: "from-rose-500 to-red-600",
    },
    {
      to: "/member/tracking",
      label: "Tracking",
      desc: `Total issues: ${stats.issues}`,
      icon: ClipboardList,
      color: "from-violet-500 to-purple-600",
    },
    {
      to: "/member/reissue",
      label: "Reissue",
      desc: `Pending: ${stats.reissueRequests}`,
      icon: RefreshCcw,
      color: "from-cyan-500 to-blue-600",
    },
    {
      to: "/member/students",
      label: "Students",
      desc: "View, message, remove",
      icon: Users,
      color: "from-slate-600 to-slate-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <LayoutDashboard className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold">Member Dashboard</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Assigned tasks ke hisab se quick access cards.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="soft-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/50"
          >
            <div
              className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${c.color} p-2.5 text-white`}
            >
              <c.icon className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-800 group-hover:text-emerald-600 dark:text-slate-100">
              {c.label}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {c.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
