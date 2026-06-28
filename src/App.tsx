import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./lib/auth";
import { pullCloud, startCloudSync } from "./lib/sync";
import Layout from "./components/Layout";
import Splash from "./components/Splash";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

const Water = lazy(() => import("./pages/Water"));
const Stats = lazy(() => import("./pages/Stats"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Program = lazy(() => import("./pages/Program"));
const Coach = lazy(() => import("./pages/Coach"));
const Workout = lazy(() => import("./pages/Workout"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

function Spinner() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // Cloud sync: pull on login, then push debounced changes.
  useEffect(() => {
    if (!user) return;
    let stop = () => {};
    pullCloud(user.id).finally(() => {
      stop = startCloudSync(user.id);
    });
    return () => stop();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-black">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <Layout>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/water" element={<Water />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/program" element={<Program />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence>{splash && <Splash key="splash" />}</AnimatePresence>
      <AppRoutes />
    </AuthProvider>
  );
}
