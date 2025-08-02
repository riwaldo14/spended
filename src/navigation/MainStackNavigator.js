import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigator";
import TransactionFormScreen from "../screens/Transactions/TransactionFormScreen";
import TransactionDetailScreen from "../screens/Transactions/TransactionDetailScreen";
import ChooseAccountScreen from "../screens/Accounts/ChooseAccountScreen";
import AccountFormScreen from "../screens/Accounts/AccountFormScreen";
import ChooseCategoryScreen from "../screens/Categories/ChooseCategoryScreen";
import CategoryFormScreen from "../screens/Categories/CategoryFormScreen";

const Stack = createStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main tab navigator as the root */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Transaction screens */}
      <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />

      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
      />

      {/* Account screens */}
      <Stack.Screen name="ChooseAccount" component={ChooseAccountScreen} />

      <Stack.Screen name="AccountForm" component={AccountFormScreen} />

      {/* Category screens */}
      <Stack.Screen name="ChooseCategory" component={ChooseCategoryScreen} />

      <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
    </Stack.Navigator>
  );
}
