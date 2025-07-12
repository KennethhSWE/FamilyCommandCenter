// frontend/app/onboarding/AddKidsScreen.tsx
//--------------------------------------------------------------
//  On-boarding step • Collect kids’ names + ages
//--------------------------------------------------------------
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
import { getToken, getHouseholdId } from "../../src/lib/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    (k) => k.name.toLowerCase() === cleanedName.toLowerCase()
  );
  const canAdd =
    cleanedName !== "" && age !== "" && !dup && +age > 0 && +age <= 17;

  /* ---------------------------------------------------------- */
  const addKid = () => {
    if (!canAdd) return;
    setKids([...kids, { name: cleanedName, age: +age }]);
    setName("");
    setAge("");
  };

  const saveKids = async () => {
    try {
      const [token, householdId] = await Promise.all([
        getToken(),
        getHouseholdId(),
      ]);
      const res = await fetch("http://192.168.1.122:7070/api/household/kids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ householdId, kids }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.replace("/onboarding/AddRewardsScreen");
    } catch (err) {
      console.error("Failed to save kids:", err);
      Alert.alert("Error", "Could not save kids. Try again.");
    }
  };

  /* ------------------------------ UI ------------------------------ */
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

      {/* duplicate warning */}
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

/* ---------------------------- styles ---------------------------- */
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
