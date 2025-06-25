import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@fcc_token";
const USER_KEY  = "@fcc_user";          // NEW – single-user storage

export async function checkIfUsersExist(): Promise<boolean> {
  const user = await AsyncStorage.getItem(USER_KEY);
  return !!user;                         // returns true if non-null / non-empty
}

export async function saveUser(user: any) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}
