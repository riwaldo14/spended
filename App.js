import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { WorkspaceProvider } from "./src/context/WorkspaceContext";
import { TransactionProvider } from "./src/context/TransactionContext";
import { AccountProvider } from "./src/context/AccountContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { CategoryProvider } from "./src/context/CategoryContext";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <WorkspaceProvider>
          <AccountProvider>
            <TransactionProvider>
              <CategoryProvider>
                <AppNavigator />
              </CategoryProvider>
            </TransactionProvider>
          </AccountProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
