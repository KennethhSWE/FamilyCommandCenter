import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getToken } from "../src/lib/auth";
import { getDeviceMode, DeviceMode } from "../src/lib/deviceMode";

export default function AppLauncher() {
  const [checkingApp, setCheckingApp] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode | null>(null);

  useEffect(() => {
    const checkStoredSession = async () => {
      const token = await getToken();
      const storedDeviceMode = await getDeviceMode();

      setHasToken(!!token);
      setDeviceMode(storedDeviceMode);
      setCheckingApp(false);
    };

    checkStoredSession();
  }, []);

  if (checkingApp) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasToken) {
    return <Redirect href={"/welcome" as any} />;
  }

  if (!deviceMode) {
    return <Redirect href={"/mode-select" as any} />;
  }

  if (deviceMode === "hub") {
    return <Redirect href={"/hub" as any} />;
  }

  return <Redirect href={"/(tabs)" as any} />;
}
