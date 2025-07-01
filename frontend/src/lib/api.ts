import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.122:7070/api", // adjust if your port / prefix differs
  timeout: 8000,
});

/* ------------------------------------------------------------------ */
/* Types that match your Postgres rows                                */
/* ------------------------------------------------------------------ */
/* frontend/src/lib/api.ts */
export interface Kid {
  id: string;
  name: string;
  role: "kid" | "parent";
  points?: number;
  avatar?: string;
}

const API = "http://192.168.1.122:7070"; // ← your PC’s LAN IP

export async function getKids(): Promise<Kid[]> {
  const res = await fetch(`${API}/api/users/kids`);
  if (!res.ok) throw new Error(`getKids ${res.status}`);
  return res.json();
}

export async function getChoresByKid(kidId: string) {
  const res = await fetch(`${API}/api/chores?userId=${kidId}`);
  if (!res.ok) throw new Error(`getChores ${res.status}`);
  return res.json();
}
