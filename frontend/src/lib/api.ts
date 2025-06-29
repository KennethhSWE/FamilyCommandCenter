import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:7070/api", // adjust if your port / prefix differs
  timeout: 8000,
});

/* ------------------------------------------------------------------ */
/* Types that match your Postgres rows                                */
/* ------------------------------------------------------------------ */
export interface Kid {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  role: "kid";
}

export interface Chore {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
}

/* ------------------------------------------------------------------ */
/* API calls                                                          */
/* ------------------------------------------------------------------ */
export const getKids = async (): Promise<Kid[]> => {
  const res = await api.get<Kid[]>("/users/kids");
  return res.data;
};

export const getChoresByKid = async (userId: string): Promise<Chore[]> => {
  const res = await api.get<Chore[]>(`/chores`, { params: { userId } });
  return res.data;
};
