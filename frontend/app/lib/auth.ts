import AsyncStorage from "@react-native-async-storage/async-storage";

/* ------------------------------------------------------------------ */
/* Keys                                                               */
/* ------------------------------------------------------------------ */
const USER_KEY  = "@fcc_user";   // single-family record
const TOKEN_KEY = "@fcc_token";  // auth / session token

/* ------------------------------------------------------------------ */
/* User helpers                                                       */
/* ------------------------------------------------------------------ */

/** Returns `true` if a user record is stored. */
export async function checkIfUsersExist(): Promise<boolean> {
  const user = await AsyncStorage.getItem(USER_KEY);
  return !!user;
}

/** Persist (or overwrite) the user record. */
export async function saveUser(user: unknown): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Retrieve the saved user object, or `null` if none. */
export async function getUser<T = any>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

/** Removes the stored user (useful for logout / reset). */
export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

/* ------------------------------------------------------------------ */
/* Token helpers (optional but handy)                                 */
/* ------------------------------------------------------------------ */

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
