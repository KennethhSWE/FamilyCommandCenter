import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getToken } from "./auth";

/* ------------ Axios instance w/ automatic Bearer token ------------ */
const BASE_URL = "http://10.0.2.2:7070/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

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
  username: string;
  name: string;
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
  overdue?: boolean;
  dueDate: string;
}

export interface Reward {
  id: number;
  name: string;
  cost: number;
  requiresApproval: boolean;
}

type RawKid = {
  id: number;
  username: string;
  age: number;
  role: "kid" | "parent";
};

type RawChore = {
  id: number;
  name: string;
  assignedTo?: string;
  assigned_to?: string;
  points: number;
  complete?: boolean;
  isComplete?: boolean;
  requestedComplete?: boolean;
  requested_complete?: boolean;
  dueDate?: string;
  due_date?: string;
};

type RawPoints = {
  user_name: string;
  total_points: number;
};

/* ---- internal helper so all calls return data or throw ---- */
const unwrap = async <T>(p: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    return (await p).data;
  } catch (e: any) {
    console.error("[API]", e.response?.data ?? e.message);
    throw e;
  }
};

/* ===================================================================
   Kids
   =================================================================== */
export const getKids = async (): Promise<Kid[]> => {
  const raw = await unwrap<RawKid[]>(api.get("/users/kids"));
  return raw.map((k) => ({ ...k, name: k.username }));
};

export const getKidsByHousehold = async (
  householdId: string,
): Promise<Kid[]> => {
  if (!householdId) {
    throw new Error("getKidsByHousehold: missing householdId");
  }

  const raw = await unwrap<RawKid[]>(
    api.get(`/kids/${encodeURIComponent(householdId)}`),
  );

  return raw.map((k) => ({ ...k, name: k.username }));
};

/* ===================================================================
   Chores
   Back-end route: GET /api/chores/kid/{username}
   =================================================================== */
export const getChoresByKid = async (username: string): Promise<Chore[]> => {
  const raw = await unwrap<RawChore[]>(
    api.get(`/chores/kid/${encodeURIComponent(username)}`),
  );

  const today = new Date().toISOString().slice(0, 10);

  return raw.map((c) => {
    const dueDate = c.dueDate ?? c.due_date ?? "";
    const complete = c.complete ?? c.isComplete ?? false;
    const requestedComplete =
      c.requestedComplete ?? c.requested_complete ?? false;
    const assignedTo = c.assignedTo ?? c.assigned_to ?? "";

    return {
      id: c.id,
      name: c.name,
      assignedTo,
      points: c.points,
      complete,
      requestedComplete,
      dueDate,
      overdue: !complete && !!dueDate && dueDate < today,
    };
  });
};

export const createChore = (c: Partial<Chore>) =>
  unwrap(api.post("/chores", c));

export const createChoreBulk = (chores: Partial<Chore>[]) =>
  unwrap(api.post("/chores/bulk", chores));

export const completeChore = (id: number) =>
  unwrap(api.post(`/chores/complete/${id}`));

/* ===================================================================
   Rewards & Points
   =================================================================== */
export const createRewardBulk = (
  householdId: string,
  rewards: { name: string; cost: number; requiresApproval: boolean }[],
) => unwrap(api.post("/rewards/bulk", { householdId, rewards }));

export const redeemReward = (rewardId: number, username: string) =>
  unwrap(api.post("/rewards/redeem", { rewardId, username }));

export const approveRewardRedemption = (redemptionId: number) =>
  unwrap(api.put(`/rewards/approve/${redemptionId}`));

export const getPoints = async (username: string): Promise<number> => {
  const raw = await unwrap<RawPoints>(
    api.get(`/points/${encodeURIComponent(username)}`),
  );
  return raw.total_points;
};
