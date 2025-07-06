// frontend/app/onboarding/AddChoresScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { getToken, getHouseholdId } from "src/lib/auth";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";

interface Chore {
  id: string;
  name: string;
  points: number;
}

const starterChores: Chore[] = [
  { id: "1", name: "Make your bed",      points: 10 },
  { id: "2", name: "Feed the pet",       points: 15 },
  { id: "3", name: "Take out trash",     points: 20 },
  { id: "4", name: "Clean your room",    points: 25 },
];

export default function AddChoresScreen() {
  const scheme = useColorScheme();
  const c = scheme === "dark"
    ? { bg: "#000", text: "#FFF", border: "#666" }
    : { bg: "#FFF", text: "#000", border: "#CCC" };

  const [chores, setChores] = useState<Chore[]>(starterChores);
  const [name, setName]     = useState("");
  const [points, setPoints] = useState("10");

  /* helpers */
  const addCustomChore = () => {
    if (!name.trim() || !points) return;
    setChores([
      ...chores,
      { id: uuid(), name: name.trim(), points: parseInt(points) },
    ]);
    setName(""); setPoints("10");
  };

  const finishOnboarding = async () => {
    try {
      const token       = await getToken();
      const householdId = await getHouseholdId();
      if (!token || !householdId) throw new Error("Missing auth");

      await fetch("http://192.168.1.122:7070/api/chores/bulk", {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization : `Bearer ${token}`,
        },
        body: JSON.stringify({ householdId, chores }),
      });

      // ▶ done – go to the Kids tab
      router.replace("/(tabs)/kids");
    } catch (err) {
      console.error("Save chores failed:", err);
      Alert.alert("Error", "Could not save chores.  Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <Text style={[styles.title, { color: c.text }]}>Add Chores</Text>

          <FlatList
            data={chores}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <Text style={[styles.item, { color: c.text }]}>
                {item.name} – {item.points} pts
              </Text>
            )}
            style={{ flexGrow: 0 }}
          />

          <TextInput
            placeholder="Chore name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: c.border, color: c.text }]}
          />
          <Picker
            selectedValue={points}
            onValueChange={setPoints}
            style={{ color: c.text }}
          >
            {[10, 15, 20, 25, 30, 40].map((n) => (
              <Picker.Item key={n} label={`${n} pts`} value={`${n}`} />
            ))}
          </Picker>
          <Button title="Add chore" onPress={addCustomChore} />

          <View style={{ marginTop: 24 }}>
            <Button title="Finish" onPress={finishOnboarding} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title:     { fontSize: 24, fontWeight: "600", marginBottom: 12 },
  input:     {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },
  item:      { fontSize: 18, paddingVertical: 4 },
});
