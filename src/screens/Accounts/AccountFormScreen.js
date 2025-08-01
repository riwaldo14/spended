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
import { useAccount } from "../../context/AccountContext";

export default function AccountFormScreen({ navigation, route }) {
  // Check if we're editing (account data is passed) or adding new
  const isEditing = route.params?.account ? true : false;
  const accountId = route.params?.accountId;
  const initialAccount = route.params?.account;

  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [type, setType] = useState("cash");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { addAccount, updateAccount } = useAccount();

  // Account types
  const ACCOUNT_TYPES = [
    { value: "cash", label: "Cash", icon: "cash-outline" },
    { value: "bank", label: "Bank", icon: "card-outline" },
  ];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && initialAccount) {
      setName(initialAccount.name);
      setInitialBalance(initialAccount.initialBalance?.toString() || "0");
      setType(initialAccount.type || "cash");
      setNote(initialAccount.note || "");
    }
  }, [isEditing, initialAccount]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter an account name");
      return;
    }

    const numericBalance = parseFloat(initialBalance) || 0;

    try {
      setIsLoading(true);

      const accountData = {
        name: name.trim(),
        initialBalance: numericBalance,
        type,
        note: note.trim(),
      };

      if (isEditing) {
        // Update existing account
        await updateAccount(accountId, accountData);
      } else {
        // Add new account
        await addAccount(accountData);

        Alert.alert("Success", "Account created successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // For editing, just navigate back
      navigation.goBack();
    } catch (error) {
      const errorMessage = isEditing
        ? "Failed to update account. Please try again."
        : "Failed to create account. Please try again.";
      Alert.alert("Error", errorMessage);
      console.error(`${isEditing ? "Update" : "Add"} account error:`, error);
    } finally {
      setIsLoading(false);
    }
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
          {isEditing ? "Edit Account" : "Add Account"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cash, BCA, Wallet"
              value={name}
              onChangeText={setName}
              maxLength={50}
              returnKeyType="next"
            />
          </View>

          {/* Initial Balance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Initial Balance</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
              returnKeyType="next"
            />
            <Text style={styles.helperText}>
              Optional: Set the starting balance for this account
            </Text>
          </View>

          {/* Account Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Type</Text>
            <View style={styles.typeContainer}>
              {ACCOUNT_TYPES.map((accountType) => (
                <TouchableOpacity
                  key={accountType.value}
                  style={[
                    styles.typeButton,
                    type === accountType.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setType(accountType.value)}
                >
                  <Ionicons
                    name={accountType.icon}
                    size={20}
                    color={type === accountType.value ? "#ffffff" : "#3498db"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === accountType.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {accountType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes about this account"
              value={note}
              onChangeText={setNote}
              maxLength={200}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!name.trim() || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!name.trim() || isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Account"
                : "Create Account"}
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
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
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
