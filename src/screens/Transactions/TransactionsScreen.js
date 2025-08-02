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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useTransaction } from "../../context/TransactionContext";
import { useCategory } from "../../context/CategoryContext";
import MonthlyFilter from "../../components/MonthlyFilter/MonthlyFilter";

const screenWidth = Dimensions.get("window").width;

export default function TransactionsScreen({ navigation }) {
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

  // Generate chart data for react-native-gifted-charts
  const chartData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const incomeData = [];
    const expenseData = [];

    // Create daily data for the chart
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = filteredTransactions.filter((t) => {
        const transactionDate = t.date.toDate
          ? t.date.toDate()
          : new Date(t.date);
        return transactionDate.getDate() === day;
      });

      const dayIncome = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      // Income data points
      incomeData.push({
        value: dayIncome / 1000, // Convert to thousands for better display
        label: day.toString(),
        labelTextStyle: { color: "#7f8c8d", fontSize: 10 },
        dataPointText: dayIncome > 0 ? `${(dayIncome / 1000).toFixed(1)}k` : "",
        textShiftY: -10,
        textShiftX: 0,
        textColor: "#27ae60",
        textFontSize: 10,
      });

      // Expense data points
      expenseData.push({
        value: dayExpense / 1000,
        label: day.toString(),
        labelTextStyle: { color: "#7f8c8d", fontSize: 10 },
        dataPointText:
          dayExpense > 0 ? `${(dayExpense / 1000).toFixed(1)}k` : "",
        textShiftY: -10,
        textShiftX: 0,
        textColor: "#e74c3c",
        textFontSize: 10,
      });
    }

    return { incomeData, expenseData };
  }, [filteredTransactions, currentMonth, currentYear]);

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleWorkspacePress = () => {
    // Navigate to workspace list (empty for now)
    console.log("Navigate to workspace list");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryData = (categoryName, type) => {
    const categoryData = categories.find(
      (cat) => cat.name === categoryName && cat.type === type
    );
    return {
      icon: categoryData?.icon || "pricetag-outline",
      color: categoryData?.color || (type === "income" ? "#27ae60" : "#e74c3c"),
    };
  };

  const handleTransactionPress = (transaction) => {
    navigation.navigate("TransactionDetail", { transactionId: transaction.id });
  };

  const renderTransactionItem = ({ item }) => {
    const categoryData = getCategoryData(item.category, item.type);

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: `${categoryData.color}20` },
            ]}
          >
            <Ionicons
              name={categoryData.icon}
              size={20}
              color={categoryData.color}
            />
          </View>
          <View style={styles.transactionInfo}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionCategory}>{item.category}</Text>
              <Text style={styles.transactionDate}>
                {formatDate(item.date)}
              </Text>
            </View>
            <Text style={styles.transactionAccount}>{item.account}</Text>
            {item.description && (
              <Text style={styles.transactionNote}>{item.description}</Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              { color: item.type === "income" ? "#27ae60" : "#e74c3c" },
            ]}
          >
            {item.type === "income" ? "+" : "-"}
            {formatCurrency(item.amount)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#bdc3c7"
            style={styles.chevronIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = React.useCallback(() => {
    // Refresh will be handled automatically by the real-time listener
  }, []);

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Income vs Expense Trend</Text>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.chartScrollContainer}
            style={styles.chartScrollView}
          >
            <LineChart
              data={chartData.expenseData}
              data2={chartData.incomeData}
              width={Math.max(
                screenWidth - 80,
                chartData.expenseData.length * 35
              )} // Dynamic width based on data points
              height={180}
              spacing={35} // Fixed spacing for consistent visualization
              initialSpacing={15}
              endSpacing={15}
              // Styling
              //   curved={true}
              thickness={2}
              thickness2={2}
              color1="#e74c3c" // Expense line color
              color2="#27ae60" // Income line color
              // Data points
              dataPointsHeight={6}
              dataPointsWidth={6}
              dataPointsColor1="#e74c3c"
              dataPointsColor2="#27ae60"
              dataPointsRadius={3}
              // Grid and axes
              rulesType="dashed"
              rulesColor="#e1e8ed"
              rulesThickness={1}
              xAxisColor="#e1e8ed"
              yAxisColor="#e1e8ed"
              xAxisThickness={1}
              yAxisThickness={1}
              // Labels
              xAxisLabelTextStyle={{
                color: "#7f8c8d",
                fontSize: 10,
              }}
              yAxisTextStyle={{
                color: "#7f8c8d",
                fontSize: 10,
              }}
              // Background
              backgroundColor="#ffffff"
              // Animation
              animateOnDataChange={true}
              animationDuration={1000}
              // Y-axis formatting
              formatYLabel={(value) => `${value}k`}
              noOfSections={4}
              maxValue={Math.max(
                ...chartData.expenseData.map((d) => d.value),
                ...chartData.incomeData.map((d) => d.value),
                1
              )}
              // Padding and margins
              yAxisOffset={0}
              hideYAxisText={false}
              // Show data point values on press
              showDataPointOnPress={true}
              showStripOnPress={true}
              showTextOnPress={true}
              stripHeight={180}
              stripColor="#f0f0f0"
              stripOpacity={0.5}
              // Pointer config
              pointerConfig={{
                pointer1Color: "#e74c3c",
                pointer2Color: "#27ae60",
                radius: 4,
                pointerStripHeight: 180,
                pointerStripColor: "#f0f0f0",
                pointerStripUptoDataPoint: true,
                shiftPointerLabelX: 0,
                shiftPointerLabelY: 0,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                pointerLabelComponent: (items) => {
                  return (
                    <View style={styles.pointerLabel}>
                      <Text style={styles.pointerDay}>
                        Day {items[0].label}
                      </Text>
                      <View style={styles.pointerRow}>
                        <View
                          style={styles.pointerColorBox}
                          backgroundColor="#e74c3c"
                        />
                        <Text style={styles.pointerText}>
                          Expense:{" "}
                          {(items[0].value * 1000).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          })}
                        </Text>
                      </View>
                      {items[1] && (
                        <View style={styles.pointerRow}>
                          <View
                            style={styles.pointerColorBox}
                            backgroundColor="#27ae60"
                          />
                          <Text style={styles.pointerText}>
                            Income:{" "}
                            {(items[1].value * 1000).toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            })}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                },
              }}
            />
          </ScrollView>

          {/* Chart Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#e74c3c" }]}
              />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#27ae60" }]}
              />
              <Text style={styles.legendText}>Income</Text>
            </View>
          </View>

          {/* Scroll hint */}
          <View style={styles.scrollHint}>
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color="#95a5a6"
            />
            <Text style={styles.scrollHintText}>
              Swipe horizontally to see all days
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>
            Transactions ({filteredTransactions.length})
          </Text>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>
                No transactions this month
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first transaction to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTransactions.sort((a, b) => {
                const dateA = a.date.toDate
                  ? a.date.toDate()
                  : new Date(a.date);
                const dateB = b.date.toDate
                  ? b.date.toDate()
                  : new Date(b.date);
                return dateB - dateA; // Sort by date descending
              })}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Add some bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    backgroundColor: "#f8f9fa",
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
  chartContainer: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  chartScrollView: {
    paddingHorizontal: 10,
  },
  chartScrollContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  scrollHint: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  scrollHintText: {
    fontSize: 11,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  pointerLabel: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  pointerDay: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
    textAlign: "center",
  },
  pointerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  pointerColorBox: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pointerText: {
    fontSize: 10,
    color: "#7f8c8d",
    flex: 1,
  },
  transactionsContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
    borderRadius: 8,
    marginVertical: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  transactionDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  transactionAccount: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  transactionRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  chevronIcon: {
    marginTop: 2,
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
  bottomPadding: {
    height: 20,
  },
});
