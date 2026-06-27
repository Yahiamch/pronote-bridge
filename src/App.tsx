import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

// Code-split the heavier / less-frequent routes (charts, etc.)
const Water = lazy(() => import("./pages/Water"));
const Stats = lazy(() => import("./pages/Stats"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Program = lazy(() => import("./pages/Program"));
const Coach = lazy(() => import("./pages/Coach"));
const Workout = lazy(() => import("./pages/Workout"));
const Settings = lazy(() => import("./pages/Settings"));

function Loader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-accent" />
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/water" element={<Water />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/program" element={<Program />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
