import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MonthlyFilter = ({ currentDate, onDateChange }) => {
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const navigateToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const navigateToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  return (
    <View style={styles.dateFilter}>
      <TouchableOpacity
        onPress={navigateToPreviousMonth}
        style={styles.dateArrow}
      >
        <Ionicons name="chevron-back" size={20} color="#7f8c8d" />
      </TouchableOpacity>
      <Text style={styles.dateText}>{formatMonthYear(currentDate)}</Text>
      <TouchableOpacity onPress={navigateToNextMonth} style={styles.dateArrow}>
        <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dateFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  dateArrow: {
    padding: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    minWidth: 80,
    textAlign: "center",
  },
});

export default MonthlyFilter;
