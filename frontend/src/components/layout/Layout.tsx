import { NavLink, Outlet } from "react-router-dom";
import { Briefcase, LayoutDashboard, FileText, Mail, Users, UserCircle, LogOut, BookmarkCheck } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jobs", label: "Find Jobs", icon: Briefcase },
  { to: "/saved", label: "Saved Jobs", icon: BookmarkCheck },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/cover-letters", label: "Cover Letters", icon: Mail },
  { to: "/networking", label: "Networking", icon: Users },
  { to: "/profile", label: "Profile & Resume", icon: UserCircle },
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-brand-700">
            <Briefcase className="h-5 w-5" />
            JobAppHelper
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">{user?.fullName}</span>
            <button onClick={() => logout()} className="btn-ghost !px-2 !py-1.5" title="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <nav className="hidden w-56 shrink-0 md:block">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white py-1.5 md:hidden">
          {NAV_ITEMS.slice(0, 5).map(({ to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => clsx("flex flex-col items-center px-2 py-1 text-[10px]", isActive ? "text-brand-700" : "text-slate-500")}
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
