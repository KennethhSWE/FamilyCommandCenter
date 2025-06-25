import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const TOKEN_KEY = "@fcc_token";
const USER_DATA_PATH = `${FileSystem.documentDirectory}users.json`;

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Check if any users exist in the users.json file
export async function checkIfUsersExist(): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(USER_DATA_PATH);
    if (!fileInfo.exists) return false;

    const content = await FileSystem.readAsStringAsync(USER_DATA_PATH);
    const users = JSON.parse(content);

    return Array.isArray(users) && users.length > 0;
  } catch (err) {
    console.warn("Error checking user data:", err);
    return false;
  }
}
