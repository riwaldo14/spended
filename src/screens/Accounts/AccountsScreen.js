import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAccount } from "../../context/AccountContext";
import { useTransaction } from "../../context/TransactionContext";

export default function AccountScreen({ navigation }) {
  const { accounts, isLoading, deleteAccount, ensureDefaultAccounts } =
    useAccount();
  const { transactions } = useTransaction();
  const [refreshing, setRefreshing] = useState(false);

  // Ensure default accounts are created when component mounts
  useEffect(() => {
    const initializeAccounts = async () => {
      if (!isLoading && accounts.length === 0) {
        try {
          await ensureDefaultAccounts();
        } catch (error) {
          console.error("Failed to create default accounts:", error);
        }
      }
    };

    initializeAccounts();
  }, [accounts.length, isLoading, ensureDefaultAccounts]);

  // Calculate actual balance for each account
  const getAccountBalance = (account, initialBalance = 0) => {
    // Filter transactions for this specific account (by account name or ID)
    const accountTransactions = transactions.filter(
      (transaction) =>
        (transaction.account === account.name ||
          transaction.account === account.id) &&
        !transaction.excludeFromCalculations
    );

    const totalTransactions = accountTransactions.reduce((sum, transaction) => {
      return transaction.type === "income"
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);

    return initialBalance + totalTransactions;
  };

  // Prepare accounts with calculated balances
  const accountsWithBalances = useMemo(() => {
    return accounts.map((account) => ({
      ...account,
      actualBalance: getAccountBalance(account, account.initialBalance || 0),
    }));
  }, [accounts, transactions]);

  // Calculate total balance across all accounts
  const totalBalance = accountsWithBalances.reduce(
    (sum, account) => sum + account.actualBalance,
    0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case "cash":
        return "cash-outline";
      case "bank":
        return "card-outline";
      default:
        return "wallet-outline";
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case "cash":
        return "Cash";
      case "bank":
        return "Bank";
      default:
        return "Account";
    }
  };

  const handleAddAccount = () => {
    navigation.navigate("AccountForm");
  };

  const handleEditAccount = (account) => {
    navigation.navigate("AccountForm", {
      account: account,
      accountId: account.id,
    });
  };

  const handleDeleteAccount = (account) => {
    // Check if account has transactions (check by both name and ID)
    const accountTransactions = transactions.filter(
      (transaction) =>
        transaction.account === account.name ||
        transaction.account === account.id
    );

    if (accountTransactions.length > 0) {
      Alert.alert(
        "Cannot Delete Account",
        `This account has ${accountTransactions.length} transaction(s). Please delete or move these transactions first.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(account.id);
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderAccountCard = ({ item: account }) => (
    <View style={styles.accountCard}>
      <TouchableOpacity
        style={styles.accountContent}
        onPress={() => handleEditAccount(account)}
        activeOpacity={0.7}
      >
        <View style={styles.accountHeader}>
          <View style={styles.accountLeft}>
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: getIconBackgroundColor(account.type) },
              ]}
            >
              <Ionicons
                name={getAccountIcon(account.type)}
                size={24}
                color={getIconColor(account.type)}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>
                {getAccountTypeLabel(account.type)}
              </Text>
              {account.note && (
                <Text style={styles.accountNote} numberOfLines={2}>
                  {account.note}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.accountRight}>
            <Text
              style={[
                styles.accountBalance,
                { color: account.actualBalance >= 0 ? "#27ae60" : "#e74c3c" },
              ]}
            >
              {formatCurrency(account.actualBalance)}
            </Text>
            {account.initialBalance !== account.actualBalance && (
              <Text style={styles.initialBalance}>
                Initial: {formatCurrency(account.initialBalance || 0)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAccount(account)}
        >
          <Ionicons name="create-outline" size={16} color="#3498db" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAccount(account)}
        >
          <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getIconBackgroundColor = (type) => {
    switch (type) {
      case "cash":
        return "#e8f5e8";
      case "bank":
        return "#e3f2fd";
      default:
        return "#f5f5f5";
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "cash":
        return "#27ae60";
      case "bank":
        return "#3498db";
      default:
        return "#7f8c8d";
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Total Balance Card */}
      <View style={styles.totalBalanceCard}>
        <Text style={styles.totalBalanceLabel}>Total Balance</Text>
        <Text
          style={[
            styles.totalBalanceAmount,
            { color: totalBalance >= 0 ? "#27ae60" : "#e74c3c" },
          ]}
        >
          {formatCurrency(totalBalance)}
        </Text>
        <Text style={styles.accountsCount}>
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
        </Text>
      </View>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyStateTitle}>No Accounts Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first account to start tracking your finances
          </Text>
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={handleAddAccount}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accountsWithBalances}
          renderItem={renderAccountCard}
          keyExtractor={(item) => item.id}
          style={styles.accountsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoading}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={styles.accountsListContent}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#3498db",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalBalanceCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  totalBalanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  accountsCount: {
    fontSize: 12,
    color: "#95a5a6",
  },
  accountsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountsListContent: {
    paddingBottom: 20,
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  accountContent: {
    padding: 20,
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  accountNote: {
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
    lineHeight: 16,
  },
  accountRight: {
    alignItems: "flex-end",
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  initialBalance: {
    fontSize: 12,
    color: "#95a5a6",
  },
  accountActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f2f6",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: "#f1f2f6",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3498db",
  },
  deleteButtonText: {
    color: "#e74c3c",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  createAccountButton: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createAccountButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
