import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTransaction } from "../../context/TransactionContext";

export default function TransactionFormScreen({ navigation, route }) {
  // Check if we're editing (transaction data is passed) or adding new
  const isEditing = route.params?.transaction ? true : false;
  const transactionId = route.params?.transactionId;
  const initialTransaction = route.params?.transaction;

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [date, setDate] = useState(new Date());
  const [excludeFromCalculations, setExcludeFromCalculations] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addTransaction, updateTransaction } = useTransaction();

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setDescription(initialTransaction.description);
      setCategory(initialTransaction.category);
      setAccount(initialTransaction.account);
      // For editing, we just store the account name since we don't have account object
      setSelectedAccount({ name: initialTransaction.account });
      setExcludeFromCalculations(
        initialTransaction.excludeFromCalculations || false
      );

      const transactionDate = initialTransaction.date.toDate
        ? initialTransaction.date.toDate()
        : new Date(initialTransaction.date);
      setDate(transactionDate);
    }
  }, [isEditing, initialTransaction]);

  const handleSave = async () => {
    // Validation
    if (!amount || !description || !category || !selectedAccount) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);

      const transactionData = {
        type,
        amount: numericAmount,
        description: description.trim(),
        category: category.trim(),
        account: selectedAccount.name,
        date: date,
        excludeFromCalculations: excludeFromCalculations,
      };

      if (isEditing) {
        // Update existing transaction
        await updateTransaction(transactionId, transactionData);
      } else {
        // Add new transaction
        await addTransaction(transactionData);

        // Show success alert only for new transactions
        Alert.alert("Success", "Transaction added successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // For editing, just navigate back
      navigation.goBack();
    } catch (error) {
      const errorMessage = isEditing
        ? "Failed to update transaction. Please try again."
        : "Failed to add transaction. Please try again.";
      Alert.alert("Error", errorMessage);
      console.error(
        `${isEditing ? "Update" : "Add"} transaction error:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseAccount = () => {
    navigation.navigate("ChooseAccount", {
      onSelectAccount: (selectedAcc) => {
        setSelectedAccount(selectedAcc);
        setAccount(selectedAcc.name);
      },
    });
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Transaction" : "Add Transaction"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Transaction Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === "expense" && styles.typeButtonActive,
                ]}
                onPress={() => setType("expense")}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={type === "expense" ? "#ffffff" : "#e74c3c"}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    type === "expense" && styles.typeButtonTextActive,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === "income" && styles.typeButtonActive,
                ]}
                onPress={() => setType("income")}
              >
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={type === "income" ? "#ffffff" : "#27ae60"}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    type === "income" && styles.typeButtonTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter transaction description"
              value={description}
              onChangeText={setDescription}
              maxLength={100}
              returnKeyType="next"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Food, Transportation, Salary"
              value={category}
              onChangeText={setCategory}
              maxLength={50}
              returnKeyType="next"
            />
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account *</Text>
            <TouchableOpacity
              style={styles.accountButton}
              onPress={handleChooseAccount}
              activeOpacity={0.7}
            >
              <View style={styles.accountButtonLeft}>
                <Ionicons
                  name={selectedAccount ? "wallet" : "wallet-outline"}
                  size={20}
                  color={selectedAccount ? "#3498db" : "#7f8c8d"}
                />
                <Text
                  style={[
                    styles.accountButtonText,
                    selectedAccount && styles.accountButtonTextSelected,
                  ]}
                >
                  {selectedAccount ? selectedAccount.name : "Choose Account"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          {/* Exclude from Calculations */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() =>
                setExcludeFromCalculations(!excludeFromCalculations)
              }
              activeOpacity={0.7}
            >
              <View style={styles.toggleLeft}>
                <Ionicons name="calculator-outline" size={20} color="#7f8c8d" />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>
                    Exclude from Calculations
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    Won't affect your balance or totals
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggleSwitch,
                  excludeFromCalculations && styles.toggleSwitchActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleSwitchThumb,
                    excludeFromCalculations && styles.toggleSwitchThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!amount ||
                !description ||
                !category ||
                !selectedAccount ||
                isLoading) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={
              !amount ||
              !description ||
              !category ||
              !selectedAccount ||
              isLoading
            }
          >
            <Text style={styles.saveButtonText}>
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                ? "Update Transaction"
                : "Save Transaction"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  placeholder: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e1e8ed",
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  typeButtonTextActive: {
    color: "#ffffff",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  accountButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountButtonText: {
    fontSize: 16,
    color: "#95a5a6",
    marginLeft: 12,
  },
  accountButtonTextSelected: {
    color: "#2c3e50",
    fontWeight: "500",
  },
  dateButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  toggleContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e1e8ed",
    justifyContent: "center",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#3498db",
  },
  toggleSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleSwitchThumbActive: {
    alignSelf: "flex-end",
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  saveButton: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
