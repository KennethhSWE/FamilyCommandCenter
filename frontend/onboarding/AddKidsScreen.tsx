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

interface Kid {
  name: string;
  age: number;
}

export default function AddKidsScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [kids, setKids] = useState<Kid[]>([]);
  const router = useRouter();

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
        <Button
          title="Next"
          onPress={async () => {
            const token = await getToken();
            const householdId = await getHouseholdId();
            router.push("./onboarding/AddRewardsScreen");
             await fetch("http://192.168.1.122:7070/api/kids", {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization : `Bearer ${token}`,
        },
        body: JSON.stringify({ householdId, kids }),
      });

      router.replace("./onboarding/AddRewardsScreen");
    }}
  />
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  kidItem: { padding: 10, fontSize: 18 },
});
