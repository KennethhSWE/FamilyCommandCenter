// ----------------------------------------------------------
//  Centralised API helper – every screen imports from here
// ----------------------------------------------------------
import axios, { AxiosResponse } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { getToken } from "./auth";

/* -----------------  Axios config  ----------------- */
const BASE_URL = "http://192.168.1.122:7070/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

/* ---- Automatically add “Authorization: Bearer …” on every request ---- */
api.interceptors.request.use(
  async (cfg: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      cfg.headers = cfg.headers || {}; // fallback, still safe
      if (typeof cfg.headers.set === "function") {
        cfg.headers.set("Authorization", `Bearer ${token}`);
      } else {
        // fallback for older Axios versions or plain object
        (cfg.headers as any)["Authorization"] = `Bearer ${token}`;
      }
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

/* -------------------  Types  ------------------- */
export interface Kid {
  id: number; // backend sends a number
  name: string; // mapped from `username`
  role: "kid" | "parent";
  age: number;
  points?: number;
}

export interface Chore {
  id: number;
  name: string;
  assignedTo: string;
  points: number;
  complete: boolean;
  requestedComplete: boolean;
}

export interface Reward {
  id: number;
  name: string;
  cost: number;
  requiresApproval: boolean;
}

/* ------- internal helper so all wrappers return data or throw ------- */
const handle = async <T>(p: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    return (await p).data;
  } catch (e: any) {
    console.error("API error:", e?.response?.data ?? e.message);
    throw e;
  }
};

/* ------------------  Exported calls  ------------------ */

// Kids -----------------------------------------------------------------
export const getKids = async (): Promise<Kid[]> => {
  /** backend returns  [{ id, username, age, role, … }] */
  const raw = await handle<
    { id: number; username: string; age: number; role: "kid" | "parent" }[]
  >(api.get("/users/kids"));

  /** This will map username to name so that the UI can view it and use it directly */
  return raw.map((k) => ({
    ...k,
    name: k.username,
  }));
};

// Chores ---------------------------------------------------------------
export const getChoresByKid = (kidId: number): Promise<Chore[]> =>
  handle(api.get("/chores", { params: { userId: kidId } }));

export const createChore = (c: Partial<Chore>) =>
  handle(api.post("/chores", c));

// Rewards & Points -----------------------------------------------------
export const getRewards = (): Promise<Reward[]> => handle(api.get("/rewards"));

export const createReward = (r: Partial<Reward>) =>
  handle(api.post("/rewards", r));

export const redeemReward = (rewardId: number, username: string) =>
  handle(api.post("/rewards/redeem", { rewardId, username }));

export const getPoints = (username: string): Promise<{ points: number }> =>
  handle(api.get(`/points/${username}`));
