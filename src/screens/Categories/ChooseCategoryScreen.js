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
import { useCategory } from "../../context/CategoryContext";

export default function ChooseCategoryScreen({ navigation, route }) {
  const { categories, isLoading, ensureDefaultCategories } = useCategory();
  const { onSelectCategory, transactionType = "expense" } = route.params || {};

  // Create default categories if none exist
  React.useEffect(() => {
    if (!isLoading && (!categories || categories.length === 0)) {
      ensureDefaultCategories();
    }
  }, [isLoading, categories, ensureDefaultCategories]);

  // Filter categories by transaction type
  const filteredCategories = (categories || []).filter(
    (category) => category.type === transactionType
  );

  const handleSelectCategory = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    navigation.goBack();
  };

  const handleAddCategory = () => {
    navigation.navigate("CategoryForm", { transactionType });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleSelectCategory(item)}
    >
      <View style={styles.categoryLeft}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: `${item.color || "#3498db"}20` },
          ]}
        >
          <Ionicons
            name={item.icon || "pricetag-outline"}
            size={24}
            color={item.color || "#3498db"}
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryType}>
            {item.type === "income" ? "Income" : "Expense"}
          </Text>
        </View>
      </View>
      <View style={styles.categoryRight}>
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
          <Text style={styles.headerTitle}>Choose Category</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading categories...</Text>
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
        <Text style={styles.headerTitle}>
          {transactionType === "income"
            ? "Income Categories"
            : "Expense Categories"}
        </Text>
        <TouchableOpacity onPress={handleAddCategory} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          style={styles.categoriesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>No categories yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first category to get started
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.addCategoryButton}
          onPress={handleAddCategory}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addCategoryButtonText}>Add New Category</Text>
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
    flex: 1,
    textAlign: "center",
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
  categoriesList: {
    flex: 1,
    padding: 20,
  },
  categoryItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
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
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  categoryType: {
    fontSize: 12,
    color: "#7f8c8d",
    textTransform: "uppercase",
  },
  categoryRight: {
    marginLeft: 8,
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
  addCategoryButton: {
    backgroundColor: "#3498db",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addCategoryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
