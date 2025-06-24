import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";

const upcomingEvents = [
  { id: 1, title: "Ella Gymnastics", date: "June 25" },
  { id: 2, title: "Lincoln Baseball", date: "June 26" },
  { id: 3, title: "Family Movie Night", date: "June 28" },
];

const dueBills = [
  { id: 1, name: "Electric Bill", due: "June 29" },
  { id: 2, name: "Car Payment", due: "July 1" },
];

export default function AdminScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🛠 Admin Panel</Text>

      <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
      {upcomingEvents.map((event) => (
        <Text key={event.id} style={styles.item}>{event.title} - {event.date}</Text>
      ))}

      <Text style={styles.sectionTitle}>💸 Upcoming Bills</Text>
      {dueBills.map((bill) => (
        <Text key={bill.id} style={styles.item}>{bill.name} - Due {bill.due}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    fontSize: 16,
    paddingVertical: 4,
  },
});
