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
import { useCategory } from "../../context/CategoryContext";

export default function CategoryFormScreen({ navigation, route }) {
  // Check if we're editing (category data is passed) or adding new
  const isEditing = route.params?.category ? true : false;
  const categoryId = route.params?.categoryId;
  const initialCategory = route.params?.category;
  const transactionType = route.params?.transactionType || "expense";

  const [name, setName] = useState("");
  const [type, setType] = useState(transactionType);
  const [icon, setIcon] = useState("pricetag-outline");
  const [color, setColor] = useState("#3498db");
  const [isLoading, setIsLoading] = useState(false);

  const { addCategory, updateCategory } = useCategory();

  // Predefined icons
  const ICONS = [
    "restaurant-outline",
    "car-outline",
    "basket-outline",
    "bag-outline",
    "game-controller-outline",
    "medical-outline",
    "school-outline",
    "flash-outline",
    "home-outline",
    "shield-outline",
    "briefcase-outline",
    "laptop-outline",
    "storefront-outline",
    "trending-up-outline",
    "gift-outline",
    "trophy-outline",
    "return-up-back-outline",
    "key-outline",
    "card-outline",
    "airplane-outline",
    "fitness-outline",
    "camera-outline",
    "musical-notes-outline",
    "book-outline",
    "cafe-outline",
    "train-outline",
    "phone-portrait-outline",
    "pricetag-outline",
  ];

  // Predefined colors
  const COLORS = [
    "#e74c3c",
    "#3498db",
    "#27ae60",
    "#9b59b6",
    "#f39c12",
    "#1abc9c",
    "#34495e",
    "#e67e22",
    "#95a5a6",
    "#2c3e50",
    "#16a085",
    "#8e44ad",
    "#2980b9",
    "#c0392b",
    "#d35400",
    "#7f8c8d",
  ];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && initialCategory) {
      setName(initialCategory.name);
      setType(initialCategory.type);
      setIcon(initialCategory.icon || "pricetag-outline");
      setColor(initialCategory.color || "#3498db");
    }
  }, [isEditing, initialCategory]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    try {
      setIsLoading(true);

      const categoryData = {
        name: name.trim(),
        type,
        icon,
        color,
      };

      if (isEditing) {
        // Update existing category
        await updateCategory(categoryId, categoryData);
      } else {
        // Add new category
        await addCategory(categoryData);

        Alert.alert("Success", "Category created successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // For editing, just navigate back
      navigation.goBack();
    } catch (error) {
      const errorMessage = isEditing
        ? "Failed to update category. Please try again."
        : "Failed to create category. Please try again.";
      Alert.alert("Error", errorMessage);
      console.error(`${isEditing ? "Update" : "Add"} category error:`, error);
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
          {isEditing ? "Edit Category" : "Add Category"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <View
                style={[styles.previewIcon, { backgroundColor: `${color}20` }]}
              >
                <Ionicons name={icon} size={32} color={color} />
              </View>
              <Text style={styles.previewName}>{name || "Category Name"}</Text>
              <Text style={styles.previewType}>
                {type === "income" ? "Income" : "Expense"}
              </Text>
            </View>
          </View>

          {/* Category Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Food, Transportation, Salary"
              value={name}
              onChangeText={setName}
              maxLength={30}
              returnKeyType="done"
            />
          </View>

          {/* Category Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Type</Text>
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

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Icon</Text>
            <View style={styles.iconsGrid}>
              {ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconButton,
                    icon === iconName && styles.iconButtonActive,
                    {
                      backgroundColor:
                        icon === iconName ? `${color}20` : "#ffffff",
                    },
                  ]}
                  onPress={() => setIcon(iconName)}
                >
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={icon === iconName ? color : "#7f8c8d"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Color</Text>
            <View style={styles.colorsGrid}>
              {COLORS.map((colorValue) => (
                <TouchableOpacity
                  key={colorValue}
                  style={[
                    styles.colorButton,
                    { backgroundColor: colorValue },
                    color === colorValue && styles.colorButtonActive,
                  ]}
                  onPress={() => setColor(colorValue)}
                >
                  {color === colorValue && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
                ? "Update Category"
                : "Create Category"}
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
    marginBottom: 12,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  previewType: {
    fontSize: 12,
    color: "#7f8c8d",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  iconButtonActive: {
    borderWidth: 2,
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorButtonActive: {
    borderColor: "#2c3e50",
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
