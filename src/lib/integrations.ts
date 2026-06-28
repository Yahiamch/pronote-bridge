import { supabase } from "./supabase";

async function bfCall(body: Record<string, unknown>) {
  if (!supabase) throw new Error("Connexion cloud requise (connecte-toi).");
  const { data, error } = await supabase.functions.invoke("basicfit", { body });
  if (error) {
    // Surface the function's JSON error message when available
    const ctx: any = (error as any).context;
    const msg = ctx?.error || error.message;
    throw new Error(msg);
  }
  return data as any;
}

export interface BfStatus {
  connected: boolean;
  status?: string;
  last_sync?: string | null;
  last_error?: string | null;
}

export const bfStatus = (): Promise<BfStatus> => bfCall({ action: "status" });
export const bfConnect = (email: string, password: string) =>
  bfCall({ action: "connect", email, password });
export const bfSync = () => bfCall({ action: "sync" });
export const bfDisconnect = () => bfCall({ action: "disconnect" });
