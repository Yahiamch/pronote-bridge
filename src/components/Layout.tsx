import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useStore } from "../store/useStore";
import ActiveBar from "./ActiveBar";
import {
  Grid,
  Calendar,
  Chart,
  Chat,
  Droplet,
  Trophy,
  Settings,
  Dumbbell,
  LogOut,
} from "./Icons";

const mobileNav = [
  { to: "/", icon: Grid, label: "Accueil", end: true },
  { to: "/calendar", icon: Calendar, label: "Calendrier" },
  { to: "/stats", icon: Chart, label: "Stats" },
  { to: "/coach", icon: Chat, label: "Coach" },
];

const sidebarNav = [
  { to: "/", icon: Grid, label: "Accueil", end: true },
  { to: "/program", icon: Trophy, label: "Programmes" },
  { to: "/water", icon: Droplet, label: "Hydratation" },
  { to: "/calendar", icon: Calendar, label: "Calendrier" },
  { to: "/stats", icon: Chart, label: "Statistiques" },
  { to: "/coach", icon: Chat, label: "Coach" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const profile = useStore((s) => s.profile);

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="relative z-10 mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-[100dvh] w-[240px] shrink-0 flex-col border-r border-white/[0.06] px-4 py-8 lg:flex">
          <div className="mb-8 flex items-center gap-3 px-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.08] border border-white/[0.08]">
              <Dumbbell size={18} />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">Forge</div>
              <div className="text-[11px] text-mute">Fitness OS</div>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5">
            {sidebarNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-mute hover:text-white/80 hover:bg-white/[0.03]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="side-active"
                        className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.06]"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <item.icon size={18} className="relative z-10 shrink-0" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-1">
            {profile.name && (
              <div className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.12] text-xs font-bold">
                  {profile.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium leading-none">{profile.name}</div>
                  <div className="mt-0.5 text-[11px] text-mute">{profile.streak} jours de suite</div>
                </div>
              </div>
            )}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "text-white bg-white/[0.08]" : "text-mute hover:text-white"
                }`
              }
            >
              <Settings size={18} />
              Réglages
            </NavLink>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-mute transition-colors hover:text-white"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="relative min-h-[100dvh] flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[680px] px-4 pb-36 pt-6 lg:max-w-none lg:px-10 lg:pt-10 lg:pb-16">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile dock */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-auto max-w-[500px] px-4 pb-[max(16px,var(--safe-bottom))]">
          <div className="mb-2.5">
            <ActiveBar />
          </div>
          <nav className="flex items-center justify-around rounded-pill border border-white/[0.08] bg-ink-850/90 px-3 py-2 backdrop-blur-2xl">
            {mobileNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="relative flex flex-1 flex-col items-center py-2"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="dock-active"
                        className="absolute inset-x-2 inset-y-0.5 rounded-pill bg-white/[0.1]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <item.icon
                      size={22}
                      className={`relative z-10 transition-colors ${
                        isActive ? "text-white" : "text-mute-soft"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
