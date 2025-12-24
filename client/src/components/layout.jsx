import { Link, Outlet, useLocation } from "react-router-dom";

function IconNotice() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M7 3h10a2 2 0 0 1 2 2v14l-3-2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 7h8M8 10h8M8 13h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavItem({ to, label, active, icon }) {
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100",
      ].join(" ")}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function Sidebar({ activePath }) {
  const isNotices = activePath.startsWith("/notices");

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="h-8 w-8 rounded-lg bg-orange-500" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-900">Nebo-IT</div>
          <div className="text-xs text-slate-500">Notice Board</div>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        <NavItem
          to="/notices"
          label="Notice Board"
          active={isNotices}
          icon={<IconNotice />}
        />
      </nav>
    </aside>
  );
}

function Topbar() {
  const dateStr = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900">
            Good Night
          </div>
          <div className="text-xs text-slate-500">{dateStr}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z"
                fill="currentColor"
              />
              <path
                d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium text-slate-900">
                Md. Yeasin
              </div>
              <div className="text-xs text-slate-500">HR</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex min-h-full w-full max-w-[1400px]">
        <Sidebar activePath={location.pathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
