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

  // Debug logging
  //   console.log("AppNavigator Debug:", {
  //     user: !!user,
  //     hasCompletedOnboarding,
  //     currentWorkspace: !!currentWorkspace,
  //     isLoading,
  //     workspaceLoading,
  //   });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user || !hasCompletedOnboarding ? (
        // User not authenticated or not completed onboarding
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !currentWorkspace ? (
        // User completed onboarding but no workspace, show workspace setup
        workspaceLoading ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : (
          <Stack.Screen name="Workspace" component={WorkspaceScreen} />
        )
      ) : (
        // User has workspace, show main app with tabs
        <Stack.Screen name="Main" component={MainStackNavigator} />
      )}
    </Stack.Navigator>
  );
}
