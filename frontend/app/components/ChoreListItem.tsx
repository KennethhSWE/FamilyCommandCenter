import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { FontAwesome5, Entypo } from "@expo/vector-icons";

interface Chore {
  id: number;
  name: string;
  assignedTo: string;
  complete: boolean;
  dueDate: string;
  points: number;
  requestedComplete?: boolean;
}

interface Props {
  chore: Chore;
  onRefresh?: () => void; // Optional refresh callback
}

export default function ChoreListItem({ chore, onRefresh }: Props) {
  const getStatusIcon = () => {
    if (chore.complete) {
      return <FontAwesome5 name="check" size={16} color="gray" />;
    } else if (chore.requestedComplete) {
      return <Entypo name="clock" size={16} color="orange" />;
    } else {
      return <Entypo name="squared-minus" size={16} color="gray" />;
    }
  };

  const handlePress = async () => {
    if (!chore.complete && !chore.requestedComplete) {
      try {
        await fetch(`http://192.168.1.122:7070/api/chores/${chore.id}/request-complete`, {
          method: "PATCH",
        });

        // Trigger refresh if callback was passed
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error requesting chore completion:", error);
      }
    }
  };

  const choreStyle = chore.complete
    ? styles.complete
    : chore.requestedComplete
    ? styles.pending
    : styles.incomplete;

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        {getStatusIcon()}
        <Text style={[styles.text, choreStyle]}>
          {chore.name} ({chore.points} pts)
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
  },
  complete: {
    color: "green",
  },
  pending: {
    color: "orange",
  },
  incomplete: {
    color: "black",
  },
});
