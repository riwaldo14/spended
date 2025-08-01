import React, { useState } from "react";
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
} from "react-native";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function WorkspaceScreen({ navigation }) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkspace } = useWorkspace();

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      Alert.alert("Error", "Please enter a workspace name");
      return;
    }

    try {
      setIsLoading(true);
      await createWorkspace(workspaceName.trim());
      // Navigation will be handled automatically by AppNavigator
    } catch (error) {
      Alert.alert("Error", "Failed to create workspace. Please try again.");
      console.error("Create workspace error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Your First Workspace</Text>
            <Text style={styles.subtitle}>
              A workspace is where all your transactions, accounts, and budgets
              will be organized.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Workspace Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Personal Finance, Family Budget"
              value={workspaceName}
              onChangeText={setWorkspaceName}
              maxLength={50}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleCreateWorkspace}
            />
            <Text style={styles.helperText}>
              You can create more workspaces later if needed.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!workspaceName.trim() || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleCreateWorkspace}
            disabled={!workspaceName.trim() || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating..." : "Create Workspace"}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 48,
  },
  label: {
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
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
