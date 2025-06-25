import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.122:7070";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
