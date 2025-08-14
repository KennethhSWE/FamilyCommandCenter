/* ------------------------------------------------------------------
   Central API helper – front-end screens import *only* from here
   ------------------------------------------------------------------ */
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getToken, getUsername } from "./auth";

/* ------------ Axios instance w/ automatic Bearer token ------------ */
const BASE_URL = "http://192.168.1.122:7070/api";


export const api = axios.create({ baseURL: BASE_URL, timeout: 10_000 });

api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers["Authorization"] = `Bearer ${token}`;
  }
  return cfg;
});

/* ----------------------------- Types ------------------------------ */
export interface Kid {
  id: number;
  username: string;          // ← raw from DB
  name: string;              // ← UI-friendly alias
  age: number;
  role: "kid" | "parent";
}

export interface Chore {
  id: number;
  name: string;
  assignedTo: string;
  points: number;
  complete: boolean;
  requestedComplete: boolean;
  overdue?: boolean;         // derived in mapper
  dueDate: string;
}

export interface Reward {
  id: number;
  name: string;
  cost: number;
  requiresApproval: boolean;
}

/* ---- internal helper so all calls return data †or throw ---- */
const unwrap = async <T>(p: Promise<AxiosResponse<T>>): Promise<T> => {
  try       { return (await p).data; }
  catch (e: any) {
    console.error("[API]", e.response?.data ?? e.message);
    throw e;
  }
};

/* ===================================================================
     Kids
   =================================================================== */
export const getKids = async (): Promise<Kid[]> => {
  const raw = await unwrap<
    { id: number; username: string; age: number; role: "kid" | "parent" }[]
  >(api.get("/users/kids"));

  return raw.map((k) => ({ ...k, name: k.username }));
};

/* ===================================================================
    Chores
   Back-end route:  GET /api/chores/kid/<kidId>
   =================================================================== */
export const getChoresByKid = async (kidId: number): Promise<Chore[]> => {
  const raw = await unwrap<
    {
      id: number;
      name: string;
      assignedTo: string;
      points: number;
      isComplete: boolean;
      requestedComplete: boolean;
      dueDate: string;
    }[]
  >(api.get(`/chores/kid/${kidId}`));

  const today = new Date().toISOString().slice(0, 10);

  return raw.map((c) => ({
    id: c.id,
    name: c.name,
    assignedTo: c.assignedTo,
    points: c.points,
    complete: c.isComplete,
    requestedComplete: c.requestedComplete,
    dueDate: c.dueDate,
    overdue: !c.isComplete && c.dueDate < today,
  }));
};

export const createChore = (c: Partial<Chore>) => unwrap(api.post("/chores", c));

/* ===================================================================
     Rewards & Points
   =================================================================== */
// GET /api/rewards
export const getRewards = (): Promise<Reward[]> => unwrap(api.get("/rewards"));

export const createReward = (r: Partial<Reward>) =>
  unwrap(api.post("/rewards", r));

export const createRewardBulk = (
  householdId: string, 
  rewards:  { name: string; cost: number; requiresApproval: boolean }[]
) => unwrap(api.post("/rewards/bulk", { householdId, rewards })); 

// POST /api/rewards/redeem
export const redeemReward = (rewardId: number, username: string) =>
  unwrap(api.post("/rewards/redeem", { rewardId, username }));

// GET /api/points-bank/<username>  → single user balance
export const getPoints = (username: string) =>
  unwrap<{ points: number }>(api.get(`/points-bank/${encodeURIComponent(username)}`));

// GET /api/points-bank              → leaderboard
export const getAllPoints = () =>
  unwrap<{ [user: string]: number }>(api.get("/points-bank"));

// Kid type this file already uses, mapping username -> name in other helpers
export type kid = { id: number; username: string; name: string; age: number; role: "kid" | "parent"};

// Drop this at the bottom of frontend/src/lib/api.ts (replace your current version)

/* ===================================================================
     Kids (household-scoped)
   Back-end route:  GET /api/kids/{householdId}
   =================================================================== */
export const getKidsByHousehold = async (householdId: string): Promise<Kid[]> => {
  // Validate input so we fail fast instead of hitting the network with an empty string
  if (!householdId) throw new Error("getKidsByHousehold: missing householdId");

  const raw = await unwrap<
    { id: number; username: string; age: number; role: "kid" | "parent" }[]
  >(api.get(`/kids/${encodeURIComponent(householdId)}`));

  // Map DB shape to UI shape (we expose `name` while keeping `username`)
  return raw.map((k) => ({ ...k, name: k.username }));
};

