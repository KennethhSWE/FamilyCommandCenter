// frontend/app/setup/kids.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { addKidsToHousehold } from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";

type SetupKid = {
  localId: string;
  name: string;
  age: string;
};

const makeSetupKidId = () =>
  `kid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export default function SetupKidsScreen() {
  const router = useRouter();

  const [kids, setKids] = useState<SetupKid[]>([
    {
      localId: makeSetupKidId(),
      name: "",
      age: "",
    },
  ]);

  const [saving, setSaving] = useState(false);

  const updateKid = (localId: string, field: "name" | "age", value: string) => {
    setKids((currentKids) =>
      currentKids.map((kid) =>
        kid.localId === localId ? { ...kid, [field]: value } : kid,
      ),
    );
  };

  const addAnotherKid = () => {
    setKids((currentKids) => [
      ...currentKids,
      {
        localId: makeSetupKidId(),
        name: "",
        age: "",
      },
    ]);
  };

  const removeKid = (localId: string) => {
    setKids((currentKids) => {
      if (currentKids.length === 1) {
        return currentKids;
      }

      return currentKids.filter((kid) => kid.localId !== localId);
    });
  };

  const saveKidsAndMoveOn = async () => {
    const cleanedKids = kids
      .map((kid) => ({
        name: kid.name.trim(),
        age: Number(kid.age),
      }))
      .filter((kid) => kid.name.length > 0);

    if (cleanedKids.length === 0) {
      Alert.alert("Kids Needed", "Add at least one kid before continuing.");
      return;
    }

    const invalidKid = cleanedKids.find(
      (kid) => !Number.isFinite(kid.age) || kid.age <= 0 || kid.age > 18,
    );

    if (invalidKid) {
      Alert.alert("Age Needed", "Each kid needs an age between 1 and 18.");
      return;
    }

    setSaving(true);

    try {
      const householdId = await getHouseholdId();

      if (!householdId) {
        Alert.alert("Setup Error", "Household ID is missing. Restart setup.");
        return;
      }

      await addKidsToHousehold(householdId, cleanedKids);

      router.replace("/setup/chores" as any);
    } catch (error: any) {
      console.error("save kids:", error);
      Alert.alert(
        "Could Not Save Kids",
        error?.response?.data ?? "Something went wrong while saving kids.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Add Kids</Text>

      <Text style={styles.subtitle}>
        Kids do not need a PIN for the tablet. They will tap their card and see
        their chores.
      </Text>

      <FlatList
        data={kids}
        keyExtractor={(kid) => kid.localId}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kid {index + 1}</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={item.name}
              onChangeText={(value) => updateKid(item.localId, "name", value)}
              placeholder="Example: Ella"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              value={item.age}
              onChangeText={(value) =>
                updateKid(
                  item.localId,
                  "age",
                  value.replace(/\D/g, "").slice(0, 2),
                )
              }
              placeholder="Example: 8"
              keyboardType="number-pad"
              style={styles.input}
            />

            {kids.length > 1 && (
              <Pressable
                style={styles.removeButton}
                onPress={() => removeKid(item.localId)}
              >
                <Text style={styles.removeButtonText}>Remove Kid</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={addAnotherKid}>
              <Text style={styles.secondaryButtonText}>Add Another Kid</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={saveKidsAndMoveOn}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Continue to Chores"}
              </Text>
            </Pressable>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  list: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  label: {
    fontWeight: "800",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  removeButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    padding: 11,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  footer: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111",
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
