import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { getToken } from "./auth";

/* ===================================================================
   Axios setup
   =================================================================== */

const getBackendHost = () => {
  const expoStuff = Constants as any;

  const hostUri =
    expoStuff.expoConfig?.hostUri ??
    expoStuff.manifest?.debuggerHost ??
    expoStuff.manifest2?.extra?.expoGo?.debuggerHost;

  if (typeof hostUri === "string" && hostUri.length > 0) {
    return hostUri.split(":")[0];
  }

  // Fallback for phone testing.
  // If Expo shows a different Metro IP, change this to match it.
  return "10.0.0.103";
};

const BASE_URL = `http://${getBackendHost()}:7070/api`;

console.log("[API] BASE_URL", BASE_URL);

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

/* ===================================================================
   Shared helper
   =================================================================== */

const unwrap = async <T>(request: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    return (await request).data;
  } catch (error: any) {
    console.error("[API]", error.response?.data ?? error.message);
    throw error;
  }
};

/* ===================================================================
   App-facing types
   =================================================================== */

export interface Kid {
  id: number;
  username: string;
  name: string;
  age: number;
  role: "kid" | "parent";
}

export interface SetupKidPayload {
  name: string;
  age: number;
}

export interface CreateHouseholdResult {
  token: string;
  householdId: string;
}

export interface DailyChoreSummary {
  kidsChecked: number;
  carriedOverChores: number;
  penaltyPointsTaken: number;
  newChoresAssigned: number;
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

export type CreateChorePayload = {
  name: string;
  assignedTo?: string;
  points: number;
  dueDate?: string;
  minAge?: number | null;
  maxAge?: number | null;
  recurring?: boolean;
  isRecurring?: boolean;
  createdBy?: number | null;
};

export interface Reward {
  id: number;
  name: string;
  cost: number;
  requiresApproval: boolean;
}

export interface RewardRedeemResult {
  status:
    | "AUTO_APPROVED"
    | "WAITING_FOR_PARENT"
    | "NOT_ENOUGH_POINTS"
    | "NOT_FOUND";
  message: string;
}

export interface ParentPinResult {
  verified: boolean;
}

export interface ApprovalQueueItem {
  id: number;
  approvalType:
    | "CHORE_COMPLETION"
    | "REWARD_REDEMPTION"
    | "REWARD_SUGGESTION"
    | "UNEVEN_CHORE_TRADE";
  relatedRecordId: number;
  status: "WAITING" | "APPROVED" | "DENIED";
  title: string;
  message: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface RewardSuggestion {
  id: number;
  suggestedBy: string;
  name: string;
  cost: number;
  reason?: string | null;
  status: string;
  createdAt?: string;
  reviewedAt?: string | null;
}

export interface ParentNotification {
  id: number;
  type:
    | "CHORE_APPROVAL_NEEDED"
    | "REWARD_APPROVAL_NEEDED"
    | "REWARD_SUGGESTION_CREATED"
    | "UNEVEN_TRADE_APPROVAL_NEEDED"
    | "BILL_DUE_SOON";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationCount {
  unreadCount: number;
}

export type CalendarEntryType = "EVENT" | "BILL";

export interface FamilyCalendarEntry {
  id: number;
  title: string;
  type: CalendarEntryType;
  entryDate: string;
  paid: boolean;
  amount?: number | null;
  notes?: string | null;
  createdAt?: string;
}

export interface CreateCalendarEntryRequest {
  title: string;
  type: CalendarEntryType;
  entryDate: string;
  amount?: number | null;
  notes?: string | null;
}

export interface PointAdjustmentResult {
  username: string;
  action: "ADD" | "REMOVE";
  oldPoints: number;
  changeAmount: number;
  newPoints: number;
  reason: string;
}

export interface PointTransaction {
  id: number;
  username: string;
  changeAmount: number;
  reason: string;
  source: string;
  createdAt: string;
}

/* ===================================================================
   Raw backend shapes
   =================================================================== */

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

type RawReward = {
  id: number;
  name: string;
  cost: number;
  requiresApproval?: boolean;
  requires_approval?: boolean;
};

/* ===================================================================
   Setup / Household
   =================================================================== */

export const createHousehold = (adminName: string, pin: string) =>
  unwrap<CreateHouseholdResult>(
    api.post("/household", {
      adminName,
      pin,
    }),
  );

export const addKidsToHousehold = (
  _householdId: string | undefined,
  kids: SetupKidPayload[],
) =>
  unwrap(
    api.post("/household/kids", {
      kids,
    }),
  );

export const addKids = (kids: SetupKidPayload[]) =>
  addKidsToHousehold(undefined, kids);

export const runDailyChoreSweep = () =>
  unwrap<DailyChoreSummary>(api.post("/assign/daily"));

/* ===================================================================
   Kids / Family
   =================================================================== */

export const getKids = async (): Promise<Kid[]> => {
  const raw = await unwrap<RawKid[]>(api.get("/kids"));

  return raw.map((kid) => ({
    ...kid,
    name: kid.username,
  }));
};

export const getKidsByHousehold = async (
  _householdId?: string,
): Promise<Kid[]> => {
  return getKids();
};

/* ===================================================================
   Chores
   =================================================================== */

export const getChoresByKid = async (username: string): Promise<Chore[]> => {
  const raw = await unwrap<RawChore[]>(
    api.get(`/chores/kid/${encodeURIComponent(username)}`),
  );

  const today = new Date().toISOString().slice(0, 10);

  return raw.map((chore) => {
    const dueDate = chore.dueDate ?? chore.due_date ?? "";
    const complete = chore.complete ?? chore.isComplete ?? false;
    const requestedComplete =
      chore.requestedComplete ?? chore.requested_complete ?? false;
    const assignedTo = chore.assignedTo ?? chore.assigned_to ?? "";

    return {
      id: chore.id,
      name: chore.name,
      assignedTo,
      points: chore.points,
      complete,
      requestedComplete,
      dueDate,
      overdue: !complete && !!dueDate && dueDate < today,
    };
  });
};

export const createChore = (chore: CreateChorePayload) => {
  const cleanedUpChore = {
    name: chore.name,
    assignedTo: chore.assignedTo,
    points: Number(chore.points) || 0,
    dueDate: chore.dueDate,
    minAge: chore.minAge ?? null,
    maxAge: chore.maxAge ?? null,
    recurring: chore.recurring ?? chore.isRecurring ?? false,
    createdBy: chore.createdBy ?? null,
  };

  return unwrap(api.post("/chores", cleanedUpChore));
};

export const createChoreBulk = (chores: CreateChorePayload[]) => {
  const cleanedUpChores = chores.map((chore) => ({
    name: chore.name,
    assignedTo: chore.assignedTo,
    points: Number(chore.points) || 0,
    dueDate: chore.dueDate,
    minAge: chore.minAge ?? null,
    maxAge: chore.maxAge ?? null,
    recurring: chore.recurring ?? chore.isRecurring ?? false,
    createdBy: chore.createdBy ?? null,
  }));

  return unwrap(api.post("/chores/bulk", cleanedUpChores));
};

export const requestChoreApproval = (choreId: number) =>
  unwrap(api.patch(`/chores/${choreId}/request-complete`));

/* ===================================================================
   Points
   =================================================================== */

export const getPoints = async (username: string): Promise<number> => {
  const raw = await unwrap<RawPoints>(
    api.get(`/points/${encodeURIComponent(username)}`),
  );

  return raw.total_points;
};

export const adjustPoints = (
  username: string,
  points: number,
  action: "ADD" | "REMOVE",
  reason: string,
) =>
  unwrap<PointAdjustmentResult>(
    api.post("/points/adjust", {
      username,
      points,
      action,
      reason,
    }),
  );

export const getRecentPointTransactions = () =>
  unwrap<PointTransaction[]>(api.get("/points/transactions/recent"));

export const getPointTransactionsForKid = (username: string) =>
  unwrap<PointTransaction[]>(api.get(`/points/transactions/${username}`));

/* ===================================================================
   Rewards
   =================================================================== */

export const getRewards = async (): Promise<Reward[]> => {
  const raw = await unwrap<RawReward[]>(api.get("/rewards"));

  return raw.map((reward) => ({
    id: reward.id,
    name: reward.name,
    cost: reward.cost,
    requiresApproval:
      reward.requiresApproval ?? reward.requires_approval ?? reward.cost > 50,
  }));
};

export const createRewardBulk = (
  _householdId: string | undefined,
  rewards: { name: string; cost: number; requiresApproval: boolean }[],
) => unwrap(api.post("/rewards/bulk", rewards));

export const createRewards = (
  rewards: { name: string; cost: number; requiresApproval: boolean }[],
) => createRewardBulk(undefined, rewards);

export const redeemReward = (rewardId: number, username: string) =>
  unwrap<RewardRedeemResult>(
    api.post("/rewards/redeem", { rewardId, username }),
  );

export const approveRewardRedemption = (redemptionId: number) =>
  unwrap(api.patch(`/rewards/approve/${redemptionId}`));

export const denyRewardRedemption = (redemptionId: number) =>
  unwrap(api.patch(`/rewards/deny/${redemptionId}`));

export const suggestReward = (
  username: string,
  name: string,
  cost: number,
  reason: string,
) =>
  unwrap<RewardSuggestion>(
    api.post("/rewards/suggest", {
      username,
      name,
      cost,
      reason,
    }),
  );

export const createReward = (
  name: string,
  cost: number,
  requiresApproval: boolean,
) =>
  unwrap<Reward>(
    api.post("/rewards", {
      name,
      cost,
      requiresApproval,
    }),
  );

export const deleteReward = (rewardId: number) =>
  unwrap(api.delete(`/rewards/${rewardId}`));

/* ===================================================================
   Approval Queue
   =================================================================== */

export const getWaitingApprovals = () =>
  unwrap<ApprovalQueueItem[]>(api.get("/approvals/waiting"));

export const approveApproval = (approvalId: number) =>
  unwrap(api.patch(`/approvals/${approvalId}/approve`));

export const denyApproval = (approvalId: number) =>
  unwrap(api.patch(`/approvals/${approvalId}/deny`));

/* ===================================================================
   Notifications
   =================================================================== */

export const getUnreadNotifications = () =>
  unwrap<ParentNotification[]>(api.get("/notifications/unread"));

export const getRecentNotifications = () =>
  unwrap<ParentNotification[]>(api.get("/notifications/recent"));

export const getUnreadNotificationCount = () =>
  unwrap<NotificationCount>(api.get("/notifications/unread-count"));

export const markNotificationRead = (notificationId: number) =>
  unwrap(api.patch(`/notifications/${notificationId}/read`));

export const markAllNotificationsRead = () =>
  unwrap(api.patch("/notifications/read-all"));

/* ===================================================================
   Parent PIN
   =================================================================== */

export const verifyParentPin = (pin: string) =>
  unwrap<ParentPinResult>(api.post("/parent-pin/verify", { pin }));

export const setParentPinDuringSetup = (newPin: string) =>
  unwrap(api.patch("/parent-pin/setup", { newPin }));

export const changeParentPin = (pin: string, newPin: string) =>
  unwrap(api.patch("/parent-pin/change", { pin, newPin }));

/* ===================================================================
   Calendar
   =================================================================== */

export const getCalendarEntries = () =>
  unwrap<FamilyCalendarEntry[]>(api.get("/calendar/entries"));

export const createCalendarEntry = (entry: CreateCalendarEntryRequest) =>
  unwrap<FamilyCalendarEntry>(api.post("/calendar/entries", entry));

export const toggleBillPaid = (entryId: number) =>
  unwrap(api.patch(`/calendar/entries/${entryId}/toggle-paid`));

export const deleteCalendarEntry = (entryId: number) =>
  unwrap(api.delete(`/calendar/entries/${entryId}`));
