// frontend/app/setup/chores.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createChoreBulk,
  CreateChorePayload,
  getKids,
  Kid,
} from "../../src/lib/api";

type SetupChore = {
  localId: string;
  name: string;
  assignedTo: string;
  points: string;
};

const makeSetupChoreId = () =>
  `chore-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const todayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function SetupChoresScreen() {
  const router = useRouter();

  const [kids, setKids] = useState<Kid[]>([]);
  const [chores, setChores] = useState<SetupChore[]>([
    {
      localId: makeSetupChoreId(),
      name: "",
      assignedTo: "",
      points: "",
    },
  ]);
  const [saving, setSaving] = useState(false);

  const loadKids = useCallback(async () => {
    try {
      const savedKids = await getKids();
      setKids(savedKids);

      if (savedKids.length > 0) {
        setChores((currentChores) =>
          currentChores.map((chore) => ({
            ...chore,
            assignedTo: chore.assignedTo || savedKids[0].username,
          })),
        );
      }
    } catch (error: any) {
      console.error("load setup kids:", error);

      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : (error?.response?.data?.message ??
            error?.message ??
            "Could not load kids.");

      Alert.alert("Could Not Load Kids", message);
    }
  }, []);

  useEffect(() => {
    loadKids();
  }, [loadKids]);

  const updateChore = (
    localId: string,
    field: "name" | "assignedTo" | "points",
    value: string,
  ) => {
    setChores((currentChores) =>
      currentChores.map((chore) =>
        chore.localId === localId ? { ...chore, [field]: value } : chore,
      ),
    );
  };

  const addAnotherChore = () => {
    setChores((currentChores) => [
      ...currentChores,
      {
        localId: makeSetupChoreId(),
        name: "",
        assignedTo: kids[0]?.username ?? "",
        points: "",
      },
    ]);
  };

  const removeChore = (localId: string) => {
    setChores((currentChores) => {
      if (currentChores.length === 1) {
        return currentChores;
      }

      return currentChores.filter((chore) => chore.localId !== localId);
    });
  };

  const saveChoresAndMoveOn = async () => {
    if (kids.length === 0) {
      Alert.alert("Kids Needed", "Add kids before creating starter chores.");
      return;
    }

    const cleanedChores: CreateChorePayload[] = chores
      .map((chore) => ({
        name: chore.name.trim(),
        assignedTo: chore.assignedTo,
        points: Number(chore.points),
        dueDate: todayDateKey(),
        minAge: null,
        maxAge: null,
        recurring: false,
        createdBy: null,
      }))
      .filter((chore) => chore.name.length > 0);

    if (cleanedChores.length === 0) {
      Alert.alert("Chores Needed", "Add at least one starter chore.");
      return;
    }

    const invalidChore = cleanedChores.find(
      (chore) =>
        !chore.assignedTo ||
        !Number.isFinite(chore.points) ||
        chore.points <= 0,
    );

    if (invalidChore) {
      Alert.alert(
        "Check Chores",
        "Each chore needs a kid assigned and a point value greater than 0.",
      );
      return;
    }

    setSaving(true);

    try {
      await createChoreBulk(cleanedChores);
      router.replace("/setup/rewards" as any);
    } catch (error: any) {
      console.error("save starter chores:", error);

      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : (error?.response?.data?.message ??
            error?.message ??
            "Could not save starter chores.");

      Alert.alert("Could Not Save Chores", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Starter Chores</Text>

      <Text style={styles.subtitle}>
        Add a few chores to get the family board started. You can add recurring
        chores and age rules later from Parent Admin.
      </Text>

      <FlatList
        data={chores}
        keyExtractor={(chore) => chore.localId}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chore {index + 1}</Text>

            <Text style={styles.label}>Chore Name</Text>
            <TextInput
              value={item.name}
              onChangeText={(value) => updateChore(item.localId, "name", value)}
              placeholder="Example: Clean basement"
              style={styles.input}
            />

            <Text style={styles.label}>Assigned Kid</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kidPickerRow}
            >
              {kids.map((kid) => {
                const selected = item.assignedTo === kid.username;

                return (
                  <Pressable
                    key={kid.username}
                    style={[styles.kidChip, selected && styles.kidChipSelected]}
                    onPress={() =>
                      updateChore(item.localId, "assignedTo", kid.username)
                    }
                  >
                    <Text
                      style={[
                        styles.kidChipText,
                        selected && styles.kidChipTextSelected,
                      ]}
                    >
                      {kid.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Points</Text>
            <TextInput
              value={item.points}
              onChangeText={(value) =>
                updateChore(
                  item.localId,
                  "points",
                  value.replace(/\D/g, "").slice(0, 3),
                )
              }
              placeholder="Example: 10"
              keyboardType="number-pad"
              style={styles.input}
            />

            {chores.length > 1 && (
              <Pressable
                style={styles.removeButton}
                onPress={() => removeChore(item.localId)}
              >
                <Text style={styles.removeButtonText}>Remove Chore</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={addAnotherChore}>
              <Text style={styles.secondaryButtonText}>Add Another Chore</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={saveChoresAndMoveOn}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Continue to Rewards"}
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
  kidPickerRow: {
    gap: 8,
    paddingBottom: 12,
  },
  kidChip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  kidChipSelected: {
    backgroundColor: "#2563eb",
  },
  kidChipText: {
    color: "#111",
    fontWeight: "800",
  },
  kidChipTextSelected: {
    color: "#fff",
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
