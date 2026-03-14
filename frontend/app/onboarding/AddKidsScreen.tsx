import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";

interface Kid {
  name: string;
  age: number;
}

export default function AddKidsScreen() {
  const scheme = useColorScheme();
  const colors =
    scheme === "dark"
      ? { bg: "#000", text: "#FFF", border: "#555", btn: "#444" }
      : { bg: "#FFF", text: "#000", border: "#CCC", btn: "#1E7D22" };

  const insets = useSafeAreaInsets();
  const [kids, setKids] = useState<Kid[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const cleanedName = name.trim();

  const dup = kids.some(
    (k) => k.name.toLowerCase() === cleanedName.toLowerCase(),
  );

  const canAdd =
    cleanedName !== "" && age !== "" && !dup && +age > 0 && +age <= 17;

  const addKid = () => {
    if (!canAdd) {
      return;
    }

    setKids([...kids, { name: cleanedName, age: +age }]);
    setName("");
    setAge("");
  };

  const saveKids = async () => {
    if (kids.length === 0) {
      Alert.alert(
        "No kids added",
        "Please add at least one kid before continuing.",
      );
      return;
    }

    try {
      const householdId = await getHouseholdId();

      if (!householdId) {
        Alert.alert("Missing household", "Please register again.");
        router.replace("/register");
        return;
      }

      await api.post("/household/kids", {
        householdId,
        kids,
      });

      router.replace("/onboarding/AddRewardsScreen");
    } catch (err: any) {
      console.error("Failed to save kids:", err);
      Alert.alert(
        "Error",
        err?.response?.data ?? "Could not save kids. Try again.",
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add Your Kids</Text>

      <TextInput
        placeholder="e.g. Ella"
        placeholderTextColor="#888"
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Age (1–17)"
        placeholderTextColor="#888"
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        maxLength={2}
      />

      {dup && (
        <Text style={styles.warn}>
          That name is already in your list – choose a nickname?
        </Text>
      )}

      <Button
        title="Add Kid"
        onPress={addKid}
        disabled={!canAdd}
        color={scheme === "dark" ? colors.btn : undefined}
      />

      <FlatList
        data={kids}
        keyExtractor={(k) => k.name}
        renderItem={({ item }) => (
          <Text style={[styles.kidItem, { color: colors.text }]}>
            • {item.name} (Age {item.age})
          </Text>
        )}
        style={{ marginTop: 12 }}
      />

      {kids.length > 0 && (
        <View style={{ paddingBottom: insets.bottom + 20, marginTop: 16 }}>
          <Button title="Next" onPress={saveKids} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  warn: { color: "#E65A46", marginBottom: 8 },
  kidItem: { fontSize: 18, paddingVertical: 4 },
});
