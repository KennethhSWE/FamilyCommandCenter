// frontend/components/ChoreListItem.tsx
//-----------------------------------------------------------------------
//  Single-line chore row used in kid/[id].tsx and admin lists
//-----------------------------------------------------------------------
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Alert,
} from "react-native";
import { FontAwesome5, Entypo } from "@expo/vector-icons";
import { api, Chore } from "../../src/lib/api";

/* ──────────────────────────────────────────────────────────── */
interface Props {
  chore: Chore;
  onRefresh?: () => void; // optional callback for parent list
}

export default function ChoreListItem({ chore, onRefresh }: Props) {
  /* ------------ theme ------------ */
  const scheme = useColorScheme();
  const colors = scheme === "dark"
    ? { base: "#fff", gray: "#888", green: "#2ecc71", orange: "#f39c12", red: "#e74c3c" }
    : { base: "#000", gray: "#666", green: "#27ae60", orange: "#d35400", red: "#c0392b" };

  /* ------------ status helpers ------------ */
  const isOverdue =
    !chore.complete &&
    new Date(chore.dueDate) < new Date(new Date().toDateString()); // before today

  const statusIcon = () => {
    if (chore.complete)
      return <FontAwesome5 name="check-circle" size={18} color={colors.green} />;
    if (chore.requestedComplete)
      return <Entypo name="clock" size={18} color={colors.orange} />;
    if (isOverdue)
      return <Entypo name="warning" size={18} color={colors.red} />;
    return <Entypo name="squared-minus" size={18} color={colors.gray} />;
  };

  /* ------------ interaction ------------ */
  const requestCompletion = async () => {
    try {
      await api.patch(`/chores/${chore.id}/request-complete`);
      onRefresh?.();
    } catch (e) {
      console.error("request-complete error:", e);
      Alert.alert("Error", "Could not request completion. Try again later.");
    }
  };

  /* pressable only if not already requested / complete */
  const disabled = chore.complete || chore.requestedComplete;

  /* ------------ render ------------ */
  return (
    <Pressable onPress={requestCompletion} disabled={disabled}>
      <View style={styles.row}>
        {statusIcon()}
        <Text
          style={[
            styles.text,
            { color: isOverdue ? colors.red : colors.base },
            chore.complete && styles.completeText,
          ]}
        >
          {chore.name} ({chore.points} pts)
        </Text>
      </View>
    </Pressable>
  );
}

/* ───────────────────────── styles ───────────────────────── */
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
  },
  completeText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
