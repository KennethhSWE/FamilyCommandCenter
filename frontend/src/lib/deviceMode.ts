import AsyncStorage from "@react-native-async-storage/async-storage";

export type DeviceMode = "hub" | "companion";

const DEVICE_MODE_KEY = "familyCommandCenter.deviceMode";

export const saveDeviceMode = async (mode: DeviceMode): Promise<void> => {
  await AsyncStorage.setItem(DEVICE_MODE_KEY, mode);
};

export const getDeviceMode = async (): Promise<DeviceMode | null> => {
  const storedMode = await AsyncStorage.getItem(DEVICE_MODE_KEY);

  if (storedMode === "hub" || storedMode === "companion") {
    return storedMode;
  }

  return null;
};

export const clearDeviceMode = async (): Promise<void> => {
  await AsyncStorage.removeItem(DEVICE_MODE_KEY);
};

export const isHubMode = async (): Promise<boolean> => {
  return (await getDeviceMode()) === "hub";
};

export const isCompanionMode = async (): Promise<boolean> => {
  return (await getDeviceMode()) === "companion";
};
