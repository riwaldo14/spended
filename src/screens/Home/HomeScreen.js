import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useTransaction } from "../../context/TransactionContext";
import { useCategory } from "../../context/CategoryContext";
import MonthlyFilter from "../../components/MonthlyFilter/MonthlyFilter";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { transactions, isLoading } = useTransaction();
  const { categories } = useCategory();

  // State for monthly filter
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month/year for filtering
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter transactions by current month/year and exclude from calculations
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (transaction.excludeFromCalculations) return false;

      const transactionDate = transaction.date.toDate
        ? transaction.date.toDate()
        : new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });
  }, [transactions, currentMonth, currentYear]);

  // Calculate totals
  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const saving = income - expense;

  // Group transactions by category and calculate totals
  const expenseCategories = useMemo(() => {
    const categoryTotals = {};

    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        if (categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] += transaction.amount;
        } else {
          categoryTotals[transaction.category] = transaction.amount;
        }
      });

    return Object.entries(categoryTotals)
      .map(([categoryName, amount]) => {
        // Find the category data to get icon and color
        const categoryData = categories.find(
          (cat) => cat.name === categoryName && cat.type === "expense"
        );
        return {
          category: categoryName,
          amount,
          icon: categoryData?.icon || "pricetag-outline",
          color: categoryData?.color || "#e74c3c",
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Get top 6 (5 + "see more")
  }, [filteredTransactions, categories]);

  const incomeCategories = useMemo(() => {
    const categoryTotals = {};

    filteredTransactions
      .filter((t) => t.type === "income")
      .forEach((transaction) => {
        if (categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] += transaction.amount;
        } else {
          categoryTotals[transaction.category] = transaction.amount;
        }
      });

    return Object.entries(categoryTotals)
      .map(([categoryName, amount]) => {
        // Find the category data to get icon and color
        const categoryData = categories.find(
          (cat) => cat.name === categoryName && cat.type === "income"
        );
        return {
          category: categoryName,
          amount,
          icon: categoryData?.icon || "pricetag-outline",
          color: categoryData?.color || "#27ae60",
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Get top 6 (5 + "see more")
  }, [filteredTransactions, categories]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleWorkspacePress = () => {
    // Navigate to workspace list (empty for now)
    console.log("Navigate to workspace list");
  };

  const renderCategoryItem = (item, index, type, isLast = false) => {
    if (
      isLast &&
      (type === "expense"
        ? expenseCategories.length > 5
        : incomeCategories.length > 5)
    ) {
      return (
        <View
          key="see-more"
          style={[styles.categoryItem, { backgroundColor: "#f5f5f5" }]}
        >
          <View
            style={[
              styles.categoryIconContainer,
              { backgroundColor: "#e1e8ed" },
            ]}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#7f8c8d" />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>See More</Text>
            <Text style={styles.categoryAmount}>...</Text>
          </View>
        </View>
      );
    }

    if (!item) return null;

    return (
      <View
        key={item.category}
        style={[styles.categoryItem, { backgroundColor: `${item.color}20` }]}
      >
        <View
          style={[
            styles.categoryIconContainer,
            { backgroundColor: `${item.color}30` },
          ]}
        >
          <Ionicons name={item.icon} size={16} color={item.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.category}</Text>
          <Text style={[styles.categoryAmount, { color: item.color }]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    );
  };

  const onRefresh = React.useCallback(() => {
    // Refresh will be handled automatically by the real-time listener
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Workspace and Date Filter */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.workspaceButton}
            onPress={handleWorkspacePress}
          >
            <Text style={styles.workspaceText}>
              {currentWorkspace?.name || "Workspace"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7f8c8d" />
          </TouchableOpacity>

          <MonthlyFilter
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        </View>

        {/* Saving Container */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Saving</Text>
            <Text
              style={[
                styles.summaryAmount,
                { color: saving >= 0 ? "#27ae60" : "#e74c3c" },
              ]}
            >
              {formatCurrency(saving)}
            </Text>
          </View>
        </View>

        {/* Expense Container */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Expense</Text>
            <Text style={[styles.categoryTotal, { color: "#e74c3c" }]}>
              {formatCurrency(expense)}
            </Text>
          </View>

          <View style={styles.categoryGrid}>
            {expenseCategories
              .slice(0, 5)
              .map((item, index) => renderCategoryItem(item, index, "expense"))}
            {expenseCategories.length > 5 &&
              renderCategoryItem(null, 5, "expense", true)}
            {expenseCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No expenses this month</Text>
              </View>
            )}
          </View>
        </View>

        {/* Income Container */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Income</Text>
            <Text style={[styles.categoryTotal, { color: "#27ae60" }]}>
              {formatCurrency(income)}
            </Text>
          </View>

          <View style={styles.categoryGrid}>
            {incomeCategories
              .slice(0, 5)
              .map((item, index) => renderCategoryItem(item, index, "income"))}
            {incomeCategories.length > 5 &&
              renderCategoryItem(null, 5, "income", true)}
            {incomeCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No income this month</Text>
              </View>
            )}
          </View>
        </View>

        {/* Add some bottom padding for the FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  workspaceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffa726",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  workspaceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  categoryContainer: {
    backgroundColor: "#ffffff",
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  categoryItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  bottomPadding: {
    height: 100,
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
