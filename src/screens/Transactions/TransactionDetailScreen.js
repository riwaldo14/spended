import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTransaction } from "../../context/TransactionContext";
import { useFocusEffect } from "@react-navigation/native";

export default function TransactionDetailScreen({ navigation, route }) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { getTransactionById, deleteTransaction } = useTransaction();

  // Reload transaction data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTransaction();
    }, [transactionId])
  );

  const loadTransaction = async () => {
    try {
      setIsLoading(true);
      const transactionData = await getTransactionById(transactionId);
      setTransaction(transactionData);
    } catch (error) {
      console.error("Load transaction error:", error);
      Alert.alert("Error", "Failed to load transaction details", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate("TransactionForm", {
      transactionId,
      transaction,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(transactionId);
      Alert.alert("Success", "Transaction deleted successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Delete transaction error:", error);
      Alert.alert("Error", "Failed to delete transaction. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="pencil-outline" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View
            style={[
              styles.typeIcon,
              {
                backgroundColor:
                  transaction.type === "income" ? "#e8f5e8" : "#ffeaea",
              },
            ]}
          >
            <Ionicons
              name={transaction.type === "income" ? "arrow-down" : "arrow-up"}
              size={24}
              color={transaction.type === "income" ? "#27ae60" : "#e74c3c"}
            />
          </View>
          <Text
            style={[
              styles.amount,
              { color: transaction.type === "income" ? "#27ae60" : "#e74c3c" },
            ]}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.transactionType}>
            {transaction.type === "income" ? "Income" : "Expense"}
          </Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{transaction.description}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{transaction.category}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>{transaction.account}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(transaction.date)}
            </Text>
          </View>

          {transaction.excludeFromCalculations && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.excludedStatusContainer}>
                <Ionicons name="calculator-outline" size={16} color="#95a5a6" />
                <Text style={styles.excludedStatusText}>
                  Excluded from calculations
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Delete Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.deleteButtonText}>
            {isDeleting ? "Deleting..." : "Delete Transaction"}
          </Text>
        </TouchableOpacity>
      </View>
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
  editButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#e74c3c",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountSection: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 16,
    color: "#7f8c8d",
    textTransform: "capitalize",
  },
  detailsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  excludedStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  excludedStatusText: {
    fontSize: 14,
    color: "#95a5a6",
    marginLeft: 6,
    fontWeight: "500",
  },
});
