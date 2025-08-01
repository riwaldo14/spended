import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";
import WorkspaceScreen from "../screens/Workspace/WorkspaceScreen";
import MainStackNavigator from "./MainStackNavigator";
import LoadingScreen from "../screens/Loading/LoadingScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, hasCompletedOnboarding } = useAuth();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && hasCompletedOnboarding ? (
        // User completed onboarding, check workspace status
        workspaceLoading ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : currentWorkspace ? (
          // User has workspace, show main app with tabs
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          // User completed onboarding but no workspace, show workspace setup
          <Stack.Screen name="Workspace" component={WorkspaceScreen} />
        )
      ) : (
        // User not authenticated or not completed onboarding
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
    </Stack.Navigator>
  );
}
