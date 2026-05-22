import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function DashboardShell({ title, subtitle, bannerImage, icon: Icon, children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-3 sm:p-5">
        <div className="animate-fade-up overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-indigo-50/20 to-cyan-50/30 shadow-xl">
          <div className="relative h-36 w-full sm:h-44">
            <img src={bannerImage} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-indigo-900/45 to-cyan-900/30" />
            <div className="absolute inset-0 flex items-center justify-between p-6 text-white">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-200">Library Portal</p>
                <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                  {Icon ? <Icon className="h-7 w-7" /> : null}
                  {title}
                </h1>
                <p className="text-sm text-slate-100">{subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/30"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="border-b bg-slate-50 px-6 py-3 text-sm text-slate-600">
            Signed in as <span className="font-semibold">{user?.name || "User"}</span> ({user?.role})
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
