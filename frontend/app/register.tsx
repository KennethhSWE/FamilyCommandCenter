import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_400Regular,
} from "@expo-google-fonts/poppins";
import React, { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import {
  saveToken,
  saveHouseholdId,
  getToken,
  getHouseholdId,
} from "../src/lib/auth";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function RegisterScreen() {
  const [adminName, setAdminName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const householdId = await getHouseholdId();
      if (token && householdId) {
        router.replace("/(tabs)/kids");
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (adminName.trim() === "" || pin.length !== 4) {
      Alert.alert("Missing info", "Please enter a name and 4-digit PIN.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.122:7070/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, pin }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { token, householdId } = await res.json();
      await saveToken(token);
      await saveHouseholdId(householdId);

      router.replace("/onboarding/AddKidsScreen");
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  let [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) return null;

  const colors =
    scheme === "dark"
      ? {
          bg: "#1B0A2A",
          text: "#FDFEFE",
          border: "#6A1B9A",
          input: "#2A0A3D",
          btn: "#F4D03F",
        }
      : {
          bg: "#E8DAEF",
          text: "#5B2C6F",
          border: "#D7BDE2",
          input: "#FFF",
          btn: "#F4D03F",
        };

  return (
    <SafeAreaView style={styles.container}>
      <LottieView
        source={require("../app/assets/lottie/stars.json")}
        autoPlay
        loop
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
          zIndex: 0,
        }}
      />

      <View style={[styles.innerContainer, { width:  SCREEN_WIDTH }]}>
        <Image
          source={require("../app/assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          🎉 Welcome to the Family Command Center
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.btn }]}>Parent name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="e.g. Danielle"
            placeholderTextColor={scheme === "dark" ? "#888" : "#AAA"}
            value={adminName}
            onChangeText={setAdminName}
          />

          <Text style={[styles.label, { color: colors.btn }]}>4-digit PIN</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="e.g. 1234"
            placeholderTextColor={scheme === "dark" ? "#888" : "#AAA"}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={setPin}
          />

          <Pressable
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.btn,
                opacity: pressed || loading ? 0.7 : 1,
              },
            ]}
            disabled={adminName.trim() === "" || pin.length !== 4 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Register & Begin</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  fullScreen: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logo: {
    width: 240,
    height: 240,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 36,
  },
  form: {
    width: "90%", // maintain nice spacing
  },
  label: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    marginLeft: 6,
  },
  input: {
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    marginBottom: 16,
    width: "100%",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
