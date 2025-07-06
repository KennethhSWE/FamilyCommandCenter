// ----------------------------------------------------------
//  Centralised API helper – every screen imports from here
// ----------------------------------------------------------
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { getToken } from "./auth";

/* -----------------  Axios config  ----------------- */
const BASE_URL = "http://192.168.1.122:7070/api"; 

export const api = axios.create({
  baseURL : BASE_URL,
  timeout : 10_000,
});

/* ---- Automatically add “Authorization: Bearer …” on every request ---- */
import type { InternalAxiosRequestConfig } from "axios";

api.interceptors.request.use(
  async (cfg: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await getToken();                           // SecureStore helper
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers['Authorization'] = `Bearer ${token}`;
    }
    return cfg;
  },
  err => Promise.reject(err)
);

/* -------------------  Types  ------------------- */
export interface Kid {
  id     : string;
  name   : string;
  role   : "kid" | "parent";
  age?   : number;
  points?: number;
  avatar?: string;
}

export interface Chore {
  id                : number;
  name              : string;
  assignedTo        : string;
  points            : number;
  complete          : boolean;
  requestedComplete : boolean;
}

export interface Reward {
  id               : number;
  name             : string;
  cost             : number;
  requiresApproval : boolean;
}

/* ------- internal wrapper so all helpers return **data** or throw ------- */
const handle = async <T>(p: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const res = await p;
    return res.data;
  } catch (e: any) {
    console.error("API error", e?.response?.data ?? e.message);
    throw e;
  }
};

/* ------------------  Exported calls  ------------------ */
// Kids
export const getKids          = (): Promise<Kid[]> =>
  handle(api.get("/users/kids"));

// Chores
export const getChoresByKid   = (kidId: string): Promise<Chore[]> =>
  handle(api.get("/chores", { params: { userId: kidId } }));

export const createChore      = (c: Partial<Chore>) =>
  handle(api.post("/chores", c));

// Rewards
export const getRewards       = (): Promise<Reward[]> =>
  handle(api.get("/rewards"));

export const createReward     = (r: Partial<Reward>) =>
  handle(api.post("/rewards", r));

export const redeemReward     = (rewardId: number, username: string) =>
  handle(api.post("/rewards/redeem", { rewardId, username }));

// Points
export const getPoints        = (username: string): Promise<{ points: number }> =>
  handle(api.get(`/points/${username}`));
