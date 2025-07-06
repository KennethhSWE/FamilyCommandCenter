// frontend/app/onboarding/AddRewardsScreen.tsx
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

interface Reward {
  id: string;       // local UUID until the DB responds
  name: string;
  cost: number;
}

const starterRewards: Reward[] = [
  { id: "1", name: "Ice-cream treat",     cost: 25 },
  { id: "2", name: "30 min screen time",  cost: 40 },
  { id: "3", name: "Trip to the park",    cost: 60 },
  { id: "4", name: "Go buy a toy",        cost: 1000},
];

export default function AddRewardsScreen() {
  const scheme = useColorScheme();
  const c = scheme === "dark"
    ? { bg: "#000", text: "#FFF", border: "#666" }
    : { bg: "#FFF", text: "#000", border: "#CCC" };

  // form state
  const [rewards, setRewards] = useState<Reward[]>(starterRewards);
  const [name,  setName ] = useState("");
  const [cost,  setCost ] = useState("25");

  /* ────── helpers ────── */
  const addCustomReward = () => {
    if (!name.trim() || !cost) return;
    setRewards([
      ...rewards,
      { id: uuid(), name: name.trim(), cost: parseInt(cost) },
    ]);
    setName(""); setCost("25");
  };

  const handleNext = async () => {
    try {
      const token       = await getToken();
      const householdId = await getHouseholdId();
      if (!token || !householdId) throw new Error("Missing auth");

      await fetch("http://192.168.1.122:7070/api/rewards/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ householdId, rewards }),
      });

      router.push("/onboarding/AddChoresScreen");
    } catch (err) {
      console.error("Save rewards failed:", err);
      Alert.alert("Error", "Could not save rewards.  Please try again.");
    }
  };

  /* ────── UI ────── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <Text style={[styles.title, { color: c.text }]}>Add Rewards</Text>

          {/* existing list */}
          <FlatList
            data={rewards}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => (
              <Text style={[styles.item, { color: c.text }]}>
                {item.name} – {item.cost} pts
              </Text>
            )}
            style={{ flexGrow: 0 }}
          />

          {/* add-custom form */}
          <TextInput
            placeholder="Reward name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: c.border, color: c.text }]}
          />
          <Picker
            selectedValue={cost}
            onValueChange={setCost}
            style={{ color: c.text }}
          >
            {[25, 40, 60, 80, 100].map((n) => (
              <Picker.Item key={n} label={`${n} pts`} value={`${n}`} />
            ))}
          </Picker>
          <Button title="Add reward" onPress={addCustomReward} />

          <View style={{ marginTop: 24 }}>
            <Button title="Next" onPress={handleNext} />
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
