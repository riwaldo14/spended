import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const AccountContext = createContext({});

export const AccountProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined accounts
  const DEFAULT_ACCOUNTS = [
    {
      name: "Wallet",
      type: "cash",
      initialBalance: 0,
      note: "Physical wallet",
    },
    { name: "Bank", type: "bank", initialBalance: 0, note: "Bank account" },
    { name: "Cash", type: "cash", initialBalance: 0, note: "Cash on hand" },
    {
      name: "Credit Card",
      type: "bank",
      initialBalance: 0,
      note: "Credit card account",
    },
    {
      name: "Savings",
      type: "bank",
      initialBalance: 0,
      note: "Savings account",
    },
  ];

  useEffect(() => {
    let unsubscribe;

    if (user && currentWorkspace) {
      unsubscribe = loadAccounts();
    } else {
      setAccounts([]);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, currentWorkspace]);

  const loadAccounts = () => {
    if (!user || !currentWorkspace) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const accountsRef = collection(workspaceRef, "accounts");

      const unsubscribe = onSnapshot(
        accountsRef,
        async (snapshot) => {
          const accountsList = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            accountsList.push({
              id: doc.id,
              ...data,
            });
          });

          // If no accounts exist, create default accounts
          if (accountsList.length === 0) {
            await createDefaultAccounts();
          } else {
            setAccounts(accountsList);
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Account listener error:", error);
          setAccounts([]);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Load accounts setup error:", error);
      setAccounts([]);
      setIsLoading(false);
      return null;
    }
  };

  const createDefaultAccounts = async () => {
    try {
      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);

      for (const defaultAccount of DEFAULT_ACCOUNTS) {
        const accountId = `acc_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const accountRef = doc(workspaceRef, "accounts", accountId);

        const accountData = {
          ...defaultAccount,
          userId: user.uid,
          workspaceId: currentWorkspace.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(accountRef, accountData);
      }
    } catch (error) {
      console.error("Create default accounts error:", error);
    }
  };

  const addAccount = async (accountData) => {
    try {
      if (!user || !currentWorkspace) {
        throw new Error("No authenticated user or workspace");
      }

      const accountId = `acc_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const accountRef = doc(workspaceRef, "accounts", accountId);

      const account = {
        ...accountData,
        userId: user.uid,
        workspaceId: currentWorkspace.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(accountRef, account);
      return { id: accountId, ...account };
    } catch (error) {
      console.error("Add account error:", error);
      throw error;
    }
  };

  const updateAccount = async (accountId, updateData) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const accountRef = doc(workspaceRef, "accounts", accountId);

      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(accountRef, updatedData);
      return updatedData;
    } catch (error) {
      console.error("Update account error:", error);
      throw error;
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const accountRef = doc(workspaceRef, "accounts", accountId);

      await deleteDoc(accountRef);
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  const getAccountById = async (accountId) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const accountRef = doc(workspaceRef, "accounts", accountId);
      const accountSnap = await getDoc(accountRef);

      if (accountSnap.exists()) {
        return { id: accountSnap.id, ...accountSnap.data() };
      } else {
        throw new Error("Account not found");
      }
    } catch (error) {
      console.error("Get account error:", error);
      throw error;
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        isLoading,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccountById,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider");
  }
  return context;
};
