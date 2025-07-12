// frontend/src/lib/auth.ts
//--------------------------------------------------------------
//  Tiny auth/storage helper used across the app
//  • JWT token → Expo SecureStore   (device-secure)
//  • householdId → AsyncStorage     (plain, non-sensitive)
//--------------------------------------------------------------
import * as SecureStore   from "expo-secure-store";
import AsyncStorage       from "@react-native-async-storage/async-storage";

/* ------------------------------------------------------------------
   TOKEN  (secure)  ––––––––––––––––––––––––––––––––––––––––––––––––– */
const TOKEN_KEY = "fcc.jwt";

// Extend globalThis to include __tokenCache
declare global {
  // eslint-disable-next-line no-var
  var __tokenCache: string | undefined;
}

export const saveToken = (token: string) =>
  SecureStore.setItemAsync(TOKEN_KEY, token);

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

/* ------------------------------------------------------------------
   HOUSEHOLD ID  (non-sensitive)  ––––––––––––––––––––––––––––––––––– */
const HH_KEY = "fcc.householdId";

export const saveHouseholdId = (id: string) =>
  AsyncStorage.setItem(HH_KEY, id);

export const getHouseholdId = () => AsyncStorage.getItem(HH_KEY);

export const deleteHouseholdId = () => AsyncStorage.removeItem(HH_KEY);

/* ------------------------------------------------------------------
   DECODE USERNAME FROM JWT  (convenience) ––––––––––––––––––––––––– */
export const getUsername = (): string => {
  // quickest:  header.payload.signature  →  Base64URL decode payload
  // no verification (read-only)
  const jwt = globalThis.__tokenCache ?? null;
  if (jwt) return jwt;                           // cached

  (async () => {
    const t = await getToken();
    if (!t) return "";
    const [, payloadB64] = t.split(".");
    const json = JSON.parse(
      decodeURIComponent(
        atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    globalThis.__tokenCache = json.sub as string;
    return json.sub as string;
  })();

  return "";
};
