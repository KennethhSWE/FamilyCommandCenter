import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ------------------------------------------------------------------
   TOKEN  (secure)
   ------------------------------------------------------------------ */
const TOKEN_KEY = "fcc.jwt";

export const saveToken = (token: string) =>
  SecureStore.setItemAsync(TOKEN_KEY, token);

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

/* ------------------------------------------------------------------
   HOUSEHOLD ID  (non-sensitive)
   ------------------------------------------------------------------ */
const HH_KEY = "fcc.householdId";

export const saveHouseholdId = (id: string) => AsyncStorage.setItem(HH_KEY, id);

export const getHouseholdId = () => AsyncStorage.getItem(HH_KEY);

export const deleteHouseholdId = () => AsyncStorage.removeItem(HH_KEY);

/* ------------------------------------------------------------------
   DECODE USERNAME FROM JWT
   ------------------------------------------------------------------ */
const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return globalThis.atob(padded);
};

export const getUsername = async (): Promise<string | null> => {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson);

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch (err) {
    console.error("Failed to decode username from token:", err);
    return null;
  }
};

export const clearAuth = async (): Promise<void> => {
  await Promise.all([deleteToken(), deleteHouseholdId()]);
};
