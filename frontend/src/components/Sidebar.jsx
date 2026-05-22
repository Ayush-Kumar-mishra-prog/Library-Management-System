import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BellIcon,
  BookMarked,
  BookOpenText,
  BookPlus,
  ChevronRightIcon,
  ClipboardList,
  Eye,
  KeyRound,
  LayoutDashboard,
  LibraryBig,
  LogOutIcon,
  MenuIcon,
  RefreshCcw,
  SearchIcon,
  SettingsIcon,
  Shield,
  UserPlus,
  UserSquare2,
  Users,
  XIcon,
} from "lucide-react";
import { apiFetch } from "../api";

const NAV_CONFIG = {
  student: [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard, end: true },
    { name: "Books", href: "/student/books", icon: BookOpenText },
    { name: "Issued Books", href: "/student/issued-books", icon: BookPlus },
    {
      name: "Notifications",
      href: "/student/notifications",
      icon: BellIcon,
      badgeKey: "notifications",
    },
    { name: "Settings", href: "/student/settings", icon: SettingsIcon },
  ],
  member: [
    { name: "Dashboard", href: "/member", icon: LayoutDashboard, end: true },
    { name: "Issue Book", href: "/member/issue-book", icon: BookPlus },
    { name: "Request Book", href: "/member/request-book", icon: BookMarked },
    {
      name: "Student Requests",
      href: "/member/student-requests",
      icon: BellIcon,
      badgeKey: "issueRequests",
    },
    {
      name: "Return Requests",
      href: "/member/return-requests",
      icon: ClipboardList,
      badgeKey: "returnRequests",
    },
    { name: "Tracking", href: "/member/tracking", icon: SearchIcon },
    {
      name: "Reissue",
      href: "/member/reissue",
      icon: RefreshCcw,
      badgeKey: "reissueRequests",
    },
    { name: "Students", href: "/member/students", icon: Users },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
    { name: "Add Book", href: "/admin/add-book", icon: BookPlus },
    { name: "Books", href: "/admin/books", icon: BookOpenText },
    { name: "Create Member", href: "/admin/create-member", icon: UserPlus },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Credentials", href: "/admin/member-credentials", icon: KeyRound },
    {
      name: "Book Requests",
      href: "/admin/book-requests",
      icon: Eye,
      badgeKey: "bookRequests",
    },
  ],
};

const ROLE_META = {
  student: { label: "Student", icon: LibraryBig },
  member: { label: "Member", icon: UserSquare2 },
  admin: { label: "Admin", icon: Shield },
};

export default function Sidebar({ role, onLogout }) {
  const { pathname } = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [badges, setBadges] = useState({});
  const [sessionUser, setSessionUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const navItems = NAV_CONFIG[role] || [];
  const roleMeta = ROLE_META[role] || ROLE_META.student;
  const RoleIcon = roleMeta.icon;

  useEffect(() => {
    setMobileMenu(false);
  }, [pathname]);

  useEffect(() => {
    const syncUser = () => {
      setSessionUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    window.addEventListener("session-user-updated", syncUser);
    return () => {
      window.removeEventListener("session-user-updated", syncUser);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadBadges = async () => {
      try {
        if (role === "student") {
          const notificationsData = await apiFetch("student/notifications");
          if (!active) return;
          const unseenCount = (notificationsData.notifications || []).filter(
            (n) => !n.seen,
          ).length;
          setBadges({ notifications: unseenCount });
          return;
        }

        if (role === "member") {
          const [issueData, returnData, reissueData] = await Promise.all([
            apiFetch("member/issue-requests"),
            apiFetch("member/return-requests"),
            apiFetch("member/reissue-requests"),
          ]);
          if (!active) return;
          setBadges({
            issueRequests: issueData.requests?.length || 0,
            returnRequests: returnData.requests?.length || 0,
            reissueRequests: reissueData.requests?.length || 0,
          });
          return;
        }

        if (role === "admin") {
          const requestData = await apiFetch("admin/book-requests");
          if (!active) return;
          setBadges({
            bookRequests:
              requestData.requests?.filter((item) => item.status === "pending")
                .length || 0,
          });
        }
      } catch {
        if (active) {
          setBadges({});
        }
      }
    };

    loadBadges();
    const refreshEvent =
      role === "student"
        ? "student-badge-refresh"
        : role === "member"
          ? "member-badge-refresh"
          : "admin-badge-refresh";
    window.addEventListener(refreshEvent, loadBadges);
    return () => {
      active = false;
      window.removeEventListener(refreshEvent, loadBadges);
    };
  }, [pathname, role]);

  const sidebarContent = useMemo(
    () => (
      <>
        <div className="border-b border-white/10 px-5 pb-5 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/10">
                <RoleIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold tracking-wide text-white">
                  Library MS
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {roleMeta.label} Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenu(false)}
              className="p-1 text-slate-400 hover:text-white lg:hidden"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        <div className="mx-3 mt-4 rounded-2xl border border-white/8 bg-white/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-sm font-bold text-slate-950">
              {(sessionUser?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {sessionUser?.name || "Library User"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {sessionUser?.department ||
                  sessionUser?.email ||
                  roleMeta.label}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-white text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
                      : "text-slate-300 hover:bg-white/6 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400" />
                    ) : null}
                    <item.icon
                      className={`h-[17px] w-[17px] shrink-0 ${
                        isActive
                          ? "text-slate-950"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {badge > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {badge}
                      </span>
                    ) : null}
                    {isActive ? (
                      <ChevronRightIcon className="h-3.5 w-3.5 text-slate-500" />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium text-slate-400 transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOutIcon className="h-[17px] w-[17px]" />
            <span>Logout</span>
          </button>
        </div>
      </>
    ),
    [RoleIcon, badges, navItems, onLogout, roleMeta.label, sessionUser],
  );

  return (
    <>
      <button
        onClick={() => setMobileMenu(true)}
        className="fixed left-4 top-4 z-50 rounded-2xl border border-slate-800 bg-slate-950 p-2 text-white shadow-lg lg:hidden"
      >
        <MenuIcon size={20} />
      </button>

      {mobileMenu ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      ) : null}

      <aside className="hidden h-full w-72 shrink-0 border-r border-white/5 bg-slate-950 text-white lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 lg:hidden ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
