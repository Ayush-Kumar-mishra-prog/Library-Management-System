import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { BellRing, BookOpen, LibraryBig, Shield, UserSquare2 } from "lucide-react";
import Sidebar from "../components/Sidebar";

const ROLE_META = {
  student: {
    title: "Student Portal",
    subtitle: "Browse books, track issues, and manage your requests",
    icon: LibraryBig,
  },
  member: {
    title: "Member Portal",
    subtitle: "Handle issue, return, and reissue workflows",
    icon: BellRing,
  },
  admin: {
    title: "Admin Portal",
    subtitle: "Manage books, members, and library operations",
    icon: Shield,
  },
};

export default function PortalLayout({ role }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const meta = ROLE_META[role] || {
    title: "Library Portal",
    subtitle: "Library Management System",
    icon: BookOpen,
  };
  const Icon = meta.icon;

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    window.addEventListener("session-user-updated", syncUser);
    return () => {
      window.removeEventListener("session-user-updated", syncUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_30%),linear-gradient(135deg,#f8fafc_0%,#ffffff_45%,#eef4ff_100%)] text-slate-900">
      <Sidebar role={role} onLogout={logout} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 pt-16 sm:p-6 lg:p-8">
          <section className="mb-6 overflow-hidden rounded-[28px] border border-white/80 bg-white/85 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="relative overflow-hidden border-b border-slate-200/70 bg-slate-950 px-6 py-6 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.45),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.25),_transparent_30%)]" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Library Management System
                  </p>
                  <h1 className="flex items-center gap-3 font-heading text-2xl font-bold sm:text-3xl">
                    <span className="inline-flex rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15">
                      <Icon className="h-6 w-6" />
                    </span>
                    {meta.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-200">
                    {meta.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {user?.name || "Library User"}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      {user?.role || role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 px-6 py-3 text-sm text-slate-600">
              Signed in as <span className="font-semibold text-slate-900">{user?.email || user?.username || "user"}</span>
            </div>
          </section>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
