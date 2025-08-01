import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAccount } from "../../context/AccountContext";

export default function ChooseAccountScreen({ navigation, route }) {
  const { accounts, isLoading } = useAccount();
  const { onSelectAccount } = route.params || {};

  const handleSelectAccount = (account) => {
    if (onSelectAccount) {
      onSelectAccount(account);
    }
    navigation.goBack();
  };

  const handleAddAccount = () => {
    navigation.navigate("AccountForm");
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const renderAccountItem = ({ item }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => handleSelectAccount(item)}
    >
      <View style={styles.accountLeft}>
        <View style={styles.accountIcon}>
          <Ionicons
            name={getAccountIcon(item.type)}
            size={24}
            color="#3498db"
          />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{item.name}</Text>
          {item.note && <Text style={styles.accountNote}>{item.note}</Text>}
        </View>
      </View>
      <View style={styles.accountRight}>
        <Text style={styles.accountBalance}>
          {formatCurrency(item.initialBalance)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Choose Account</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
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
        <Text style={styles.headerTitle}>Choose Account</Text>
        <TouchableOpacity onPress={handleAddAccount} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={accounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.id}
          style={styles.accountsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>No accounts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first account to get started
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={handleAddAccount}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addAccountButtonText}>Add New Account</Text>
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
  addButton: {
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
  content: {
    flex: 1,
  },
  accountsList: {
    flex: 1,
    padding: 20,
  },
  accountItem: {
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
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  accountNote: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  accountRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7f8c8d",
    marginRight: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 100,
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
  addAccountButton: {
    backgroundColor: "#3498db",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addAccountButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
