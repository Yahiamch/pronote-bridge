import { supabase } from "./supabase";
import { useStore } from "../store/useStore";

const KEYS = [
  "folders",
  "routines",
  "sessions",
  "water",
  "weight",
  "program",
  "profile",
] as const;

function snapshot() {
  const s = useStore.getState() as any;
  const o: Record<string, unknown> = {};
  KEYS.forEach((k) => (o[k] = s[k]));
  return o;
}

function pick(data: Record<string, unknown>) {
  const o: Record<string, unknown> = {};
  KEYS.forEach((k) => {
    if (data[k] !== undefined) o[k] = data[k];
  });
  return o;
}

/** Load the user's cloud state into the store (cloud wins on login). */
export async function pullCloud(userId: string) {
  if (!supabase) return;
  const { data } = await supabase
    .from("app_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.data && typeof data.data === "object" && Object.keys(data.data).length) {
    useStore.setState((cur) => ({ ...cur, ...pick(data.data as Record<string, unknown>) }));
  } else {
    // First login on this account → seed the cloud with current local state.
    void push(userId);
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;

async function push(userId: string) {
  if (!supabase) return;
  await supabase.from("app_state").upsert({
    user_id: userId,
    data: snapshot(),
    updated_at: new Date().toISOString(),
  });
}

/** Debounced push of store changes to the cloud. Returns an unsubscribe fn. */
export function startCloudSync(userId: string) {
  if (!supabase) return () => {};
  const unsub = useStore.subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(() => void push(userId), 1200);
  });
  return () => {
    clearTimeout(timer);
    unsub();
  };
}
