// frontend/app/onboarding/AddRewardsScreen.tsx
//--------------------------------------------------------------
//  On-boarding step • Add starter rewards (bulk insert)
//--------------------------------------------------------------
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

import { createRewardBulk }   from "../../src/lib/api";   // ✅ bulk API
import { getHouseholdId }      from "../../src/lib/auth";  // ✅ HH id

import "react-native-get-random-values";
import { v4 as uuid } from "uuid";

/* ───────────────────── types ───────────────────── */
interface LocalReward {
  id:   string;
  name: string;
  cost: number;
}

/* ─────────── default starter rewards ─────────── */
const starterRewards: LocalReward[] = [
  { id: "1", name: "Ice-cream treat",    cost: 25  },
  { id: "2", name: "30 min screen time", cost: 40  },
  { id: "3", name: "Trip to the park",   cost: 60  },
  { id: "4", name: "Buy a new toy",      cost: 100 },
];

export default function AddRewardsScreen() {
  const [rewards, setRewards] = useState<LocalReward[]>(starterRewards);
  const [name,    setName ]   = useState("");
  const [cost,    setCost ]   = useState("25");

  /* ─────────── colour palette (dark / light) ─────────── */
  const isDark = useColorScheme() === "dark";
  const c = {
    bg:      isDark ? "#000" : "#FFF",
    text:    isDark ? "#FFF" : "#000",
    border:  isDark ? "#555" : "#CCC",
    card:    isDark ? "#111" : "#F7F7F7",
    btn:     "#4CAF50",
    btnText: "#FFF",
  };

  /* ─────── add custom reward locally ─────── */
  const addCustomReward = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Invalid", "Please enter a reward name.");
      return;
    }
    setRewards([
      ...rewards,
      { id: uuid(), name: trimmed, cost: parseInt(cost, 10) },
    ]);
    setName("");
    setCost("25");
  };

  /* ─────── save to backend & advance ─────── */
  const handleNext = async () => {
    try {
      const householdId = await getHouseholdId();           // must exist
      await createRewardBulk(
        householdId!,
        rewards.map(r => ({
          name:              r.name,
          cost:              r.cost,
          requiresApproval:  false,
        }))
      );
      router.push("/onboarding/AddChoresScreen");
    } catch (err) {
      console.error("Save rewards failed:", err);
      Alert.alert("Error", "Could not save rewards. Please try again.");
    }
  };

  /* ───────────────────── UI ───────────────────── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <Text style={[styles.title, { color: c.text }]}>🎁 Add Rewards</Text>

          {/* List of current rewards */}
          <FlatList
            data={rewards}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => (
              <View style={[styles.rewardItem, { backgroundColor: c.card }]}>
                <Text style={[styles.rewardText, { color: c.text }]}>
                  • {item.name}
                </Text>
                <Text style={[styles.rewardText, { color: c.text }]}>
                  {item.cost} pts
                </Text>
              </View>
            )}
            style={{ flexGrow: 0 }}
          />

          {/* Input + picker */}
          <TextInput
            placeholder="Reward name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              { borderColor: c.border, color: c.text },
            ]}
          />
          <Picker
            selectedValue={cost}
            onValueChange={setCost}
            style={{ color: c.text }}
            dropdownIconColor={c.text}
          >
            {[25, 40, 60, 80, 100].map((n) => (
              <Picker.Item key={n} label={`${n} pts`} value={`${n}`} />
            ))}
          </Picker>

          {/* Add button */}
          <Pressable
            style={[styles.button, { backgroundColor: c.btn }]}
            onPress={addCustomReward}
          >
            <Text style={[styles.buttonText, { color: c.btnText }]}>
              Add Reward
            </Text>
          </Pressable>

          {/* Next button */}
          <View style={{ marginTop: 28 }}>
            <Pressable
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next: Add Chores</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ───────────────────── styles ───────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title:     { fontSize: 26, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  rewardItem:{ flexDirection: "row", justifyContent: "space-between",
               paddingVertical: 10, paddingHorizontal: 12,
               borderRadius: 6, marginVertical: 4 },
  rewardText:{ fontSize: 18 },
  input:     { borderWidth: 1.5, borderRadius: 8, padding: 12,
               fontSize: 18, marginTop: 16 },
  button:    { marginTop: 16, paddingVertical: 14, borderRadius: 10,
               alignItems: "center" },
  buttonText:{ fontSize: 16, fontWeight: "bold" },
});
