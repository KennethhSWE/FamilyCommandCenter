import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { getHouseholdId, getToken } from "src/lib/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Kid {
  name: string;
  age: number;
}

export default function AddKidsScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [kids, setKids] = useState<Kid[]>([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();


  const handleAddKid = () => {
    if (!name || !age) return;
    setKids([...kids, { name, age: parseInt(age) }]);
    setName("");
    setAge("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Kids</Text>

      <TextInput
        placeholder="Kid's Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Age"
        style={styles.input}
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
      />
      <Button title="Add Kid" onPress={handleAddKid} />

      <FlatList
        data={kids}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.kidItem}>
            {item.name} - Age {item.age}
          </Text>
        )}
      />

     {kids.length > 0 && (
  <View style={{ paddingBottom: insets.bottom + 20, marginTop: 10 }}>
    <Button
      title="Next"
      onPress={async () => {
        const token = await getToken();
        console.log("Token: ", token);
        const householdId = await getHouseholdId();

        try {
          const res = await fetch("http://192.168.1.122:7070/api/household/kids", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ householdId, kids }),
          });

          if (!res.ok) {
            console.error("Failed to save kids:", await res.text());
            return;
          }

          router.replace("/onboarding/AddRewardsScreen");
        } catch (err) {
          console.error("Network or server error:", err);
        }
      }}
    />
  </View>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 3,
    borderColor: "#1a2a96",
    padding: 10,
    marginVertical: 6,
    borderRadius: 5,
  },
  kidItem: { padding: 10, fontSize: 20 },
});
