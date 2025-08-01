import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useTransaction } from "../../context/TransactionContext";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { transactions, isLoading, getTotalByType } = useTransaction();

  const income = getTotalByType("income");
  const expense = getTotalByType("expense");
  const balance = income - expense;

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
      month: "short",
      day: "numeric",
    });
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        item.excludeFromCalculations && styles.transactionItemExcluded,
      ]}
      onPress={() =>
        navigation.navigate("TransactionDetail", { transactionId: item.id })
      }
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: item.excludeFromCalculations
                ? "#f8f9fa"
                : item.type === "income"
                ? "#e8f5e8"
                : "#ffeaea",
            },
          ]}
        >
          {item.excludeFromCalculations ? (
            <Ionicons name="calculator-outline" size={16} color="#95a5a6" />
          ) : (
            <Ionicons
              name={item.type === "income" ? "arrow-down" : "arrow-up"}
              size={16}
              color={item.type === "income" ? "#27ae60" : "#e74c3c"}
            />
          )}
        </View>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionTitleRow}>
            <Text
              style={[
                styles.transactionDescription,
                item.excludeFromCalculations &&
                  styles.transactionDescriptionExcluded,
              ]}
            >
              {item.description}
            </Text>
            {item.excludeFromCalculations && (
              <Text style={styles.excludedBadge}>EXCLUDED</Text>
            )}
          </View>
          <Text style={styles.transactionDetails}>
            {item.category} • {item.account}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            {
              color: item.excludeFromCalculations
                ? "#95a5a6"
                : item.type === "income"
                ? "#27ae60"
                : "#e74c3c",
            },
          ]}
        >
          {item.type === "income" ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    // Refresh will be handled automatically by the real-time listener
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.workspaceName}>{currentWorkspace?.name}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            { color: balance >= 0 ? "#27ae60" : "#e74c3c" },
          ]}
        >
          {formatCurrency(balance)}
        </Text>

        <View style={styles.balanceDetails}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Income</Text>
            <Text style={[styles.balanceItemAmount, { color: "#27ae60" }]}>
              {formatCurrency(income)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Expenses</Text>
            <Text style={[styles.balanceItemAmount, { color: "#e74c3c" }]}>
              {formatCurrency(expense)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Recent Transactions</Text>
        <Text style={styles.transactionsCount}>
          {transactions.length} transactions
        </Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#bdc3c7" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first transaction to get started
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("TransactionForm")}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
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
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  workspaceName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceItem: {
    alignItems: "center",
  },
  balanceItemLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  balanceItemAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  transactionsCount: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    flex: 1,
  },
  transactionDescriptionExcluded: {
    color: "#95a5a6",
  },
  excludedBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#95a5a6",
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  transactionDetails: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  transactionItemExcluded: {
    opacity: 0.7,
    borderLeftWidth: 3,
    borderLeftColor: "#95a5a6",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#7f8c8d",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
