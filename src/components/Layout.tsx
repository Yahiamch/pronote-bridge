import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  Grid,
  Calendar,
  Chart,
  Chat,
  Droplet,
  Trophy,
  Settings,
  Dumbbell,
} from "./Icons";
import ActiveBar from "./ActiveBar";
import { useStore } from "../store/useStore";

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
  const profile = useStore((s) => s.profile);
  const streak = profile.streak;

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      {/* ambient gradient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(90,209,200,0.07),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(155,140,255,0.06),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1280px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-[100dvh] w-[248px] shrink-0 flex-col border-r border-white/[0.06] px-5 py-7 lg:flex">
          <div className="mb-9 flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-violet/20 text-accent">
              <Dumbbell size={20} />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight">Forge</div>
              <div className="text-[11px] text-mute-soft">Fitness OS</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {sidebarNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-mute hover:text-white hover:bg-white/[0.03]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="side-active"
                        className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/[0.06]"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <item.icon size={19} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-flame/20 text-accent-flame text-sm">
                🔥
              </div>
              <div className="text-sm">
                <div className="font-semibold leading-none">{streak} jours</div>
                <div className="text-[11px] text-mute-soft">série en cours</div>
              </div>
            </div>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "text-white bg-white/[0.06]" : "text-mute hover:text-white"
                }`
              }
            >
              <Settings size={19} />
              Réglages
            </NavLink>
          </div>
        </aside>

        {/* Main content */}
        <main className="relative min-h-[100dvh] flex-1">
          <div className="mx-auto w-full max-w-[640px] px-5 pb-40 pt-4 lg:max-w-none lg:px-10 lg:pt-9 lg:pb-16">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile floating dock + active bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-auto max-w-[640px] px-5 pb-[max(16px,var(--safe-bottom))]">
          <div className="mb-3">
            <ActiveBar />
          </div>
          <nav className="flex items-center justify-around rounded-pill border border-white/[0.07] bg-ink-850/80 px-2 py-2 backdrop-blur-xl">
            {mobileNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="relative flex flex-1 flex-col items-center py-1.5"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="dock-active"
                        className="absolute inset-x-3 inset-y-0 rounded-pill bg-white/[0.08]"
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
