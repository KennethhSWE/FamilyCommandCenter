import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getToken } from "../src/lib/auth";

export default function AppLauncher() {
  const [checkingAppGoblin, setCheckingAppGoblin] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkStoredSession = async () => {
      const token = await getToken();

      setHasToken(!!token);
      setCheckingAppGoblin(false);
    };

    checkStoredSession();
  }, []);

  if (checkingAppGoblin) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasToken) {
    return <Redirect href="/(tabs)/kids" />;
  }

  return <Redirect href="/register" />;
}
