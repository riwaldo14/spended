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
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const TransactionContext = createContext({});

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let unsubscribe;

    if (user && currentWorkspace) {
      unsubscribe = loadTransactions();
    } else {
      // Reset state when no user or workspace
      setTransactions([]);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, currentWorkspace]);

  const loadTransactions = () => {
    if (!user || !currentWorkspace) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get transactions subcollection from the current workspace
      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const transactionsRef = collection(workspaceRef, "transactions");

      // Simple query without orderBy to avoid index issues initially
      const unsubscribe = onSnapshot(
        transactionsRef,
        (snapshot) => {
          const transactionsList = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            transactionsList.push({
              id: doc.id,
              ...data,
            });
          });

          // Sort in memory by date (newest first)
          transactionsList.sort((a, b) => {
            const getDate = (item) => {
              if (!item.date) return new Date(0);
              return item.date.toDate
                ? item.date.toDate()
                : new Date(item.date);
            };
            return getDate(b) - getDate(a);
          });

          setTransactions(transactionsList);
          setIsLoading(false);
        },
        (error) => {
          console.error("Transaction listener error:", error);
          // Fallback to empty state on error
          setTransactions([]);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Load transactions setup error:", error);
      setTransactions([]);
      setIsLoading(false);
      return null;
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      if (!user || !currentWorkspace) {
        throw new Error("No authenticated user or workspace");
      }

      // Create transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Get reference to the workspace document
      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);

      // Get reference to the transactions subcollection
      const transactionRef = doc(workspaceRef, "transactions", transactionId);

      const transaction = {
        ...transactionData,
        userId: user.uid,
        workspaceId: currentWorkspace.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(transactionRef, transaction);
      return { id: transactionId, ...transaction };
    } catch (error) {
      console.error("Add transaction error:", error);
      throw error;
    }
  };

  const updateTransaction = async (transactionId, updateData) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const transactionRef = doc(workspaceRef, "transactions", transactionId);

      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(transactionRef, updatedData);
      return updatedData;
    } catch (error) {
      console.error("Update transaction error:", error);
      throw error;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const transactionRef = doc(workspaceRef, "transactions", transactionId);

      await deleteDoc(transactionRef);
    } catch (error) {
      console.error("Delete transaction error:", error);
      throw error;
    }
  };

  const getTransactionById = async (transactionId) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const transactionRef = doc(workspaceRef, "transactions", transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        return { id: transactionSnap.id, ...transactionSnap.data() };
      } else {
        throw new Error("Transaction not found");
      }
    } catch (error) {
      console.error("Get transaction error:", error);
      throw error;
    }
  };

  const getTransactionsByCategory = (category) => {
    return transactions.filter(
      (transaction) => transaction.category === category
    );
  };

  const getTransactionsByAccount = (account) => {
    return transactions.filter(
      (transaction) => transaction.account === account
    );
  };

  const getTotalByType = (type) => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === type && !transaction.excludeFromCalculations // Exclude transactions marked as excluded
      )
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionById,
        getTransactionsByCategory,
        getTransactionsByAccount,
        getTotalByType,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within TransactionProvider");
  }
  return context;
};
