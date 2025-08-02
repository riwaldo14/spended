import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const CategoryContext = createContext({});

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined categories
  const DEFAULT_EXPENSE_CATEGORIES = [
    {
      name: "Food",
      type: "expense",
      icon: "restaurant-outline",
      color: "#e74c3c",
    },
    {
      name: "Transportation",
      type: "expense",
      icon: "car-outline",
      color: "#3498db",
    },
    {
      name: "Groceries",
      type: "expense",
      icon: "basket-outline",
      color: "#27ae60",
    },
    {
      name: "Shopping",
      type: "expense",
      icon: "bag-outline",
      color: "#9b59b6",
    },
    {
      name: "Entertainment",
      type: "expense",
      icon: "game-controller-outline",
      color: "#f39c12",
    },
    {
      name: "Healthcare",
      type: "expense",
      icon: "medical-outline",
      color: "#1abc9c",
    },
    {
      name: "Utilities",
      type: "expense",
      icon: "flash-outline",
      color: "#e67e22",
    },
    { name: "Rent", type: "expense", icon: "home-outline", color: "#95a5a6" },
  ];

  const DEFAULT_INCOME_CATEGORIES = [
    {
      name: "Salary",
      type: "income",
      icon: "briefcase-outline",
      color: "#27ae60",
    },
    {
      name: "Freelance",
      type: "income",
      icon: "laptop-outline",
      color: "#3498db",
    },
    {
      name: "Business",
      type: "income",
      icon: "storefront-outline",
      color: "#e74c3c",
    },
    {
      name: "Investment",
      type: "income",
      icon: "trending-up-outline",
      color: "#9b59b6",
    },
    { name: "Gift", type: "income", icon: "gift-outline", color: "#f39c12" },
    { name: "Bonus", type: "income", icon: "trophy-outline", color: "#1abc9c" },
  ];

  useEffect(() => {
    let unsubscribe;

    if (user && currentWorkspace) {
      unsubscribe = loadCategories();
    } else {
      setCategories([]);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, currentWorkspace]);

  const loadCategories = () => {
    if (!user || !currentWorkspace) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const categoriesRef = collection(workspaceRef, "categories");

      const unsubscribe = onSnapshot(
        categoriesRef,
        (snapshot) => {
          const categoriesList = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            categoriesList.push({
              id: doc.id,
              ...data,
            });
          });

          setCategories(categoriesList);
          setIsLoading(false);
        },
        (error) => {
          console.error("Category listener error:", error);
          setCategories([]);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Load categories setup error:", error);
      setCategories([]);
      setIsLoading(false);
      return null;
    }
  };

  const createDefaultCategories = async () => {
    try {
      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const allDefaultCategories = [
        ...DEFAULT_EXPENSE_CATEGORIES,
        ...DEFAULT_INCOME_CATEGORIES,
      ];

      for (const defaultCategory of allDefaultCategories) {
        const categoryId = `cat_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const categoryRef = doc(workspaceRef, "categories", categoryId);

        const categoryData = {
          ...defaultCategory,
          userId: user.uid,
          workspaceId: currentWorkspace.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(categoryRef, categoryData);
      }
    } catch (error) {
      console.error("Create default categories error:", error);
    }
  };

  const ensureDefaultCategories = async () => {
    if ((!categories || categories.length === 0) && user && currentWorkspace) {
      await createDefaultCategories();
    }
  };

  const addCategory = async (categoryData) => {
    try {
      if (!user || !currentWorkspace) {
        throw new Error("No authenticated user or workspace");
      }

      const categoryId = `cat_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const categoryRef = doc(workspaceRef, "categories", categoryId);

      const category = {
        ...categoryData,
        userId: user.uid,
        workspaceId: currentWorkspace.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(categoryRef, category);
      return { id: categoryId, ...category };
    } catch (error) {
      console.error("Add category error:", error);
      throw error;
    }
  };

  const updateCategory = async (categoryId, updateData) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const categoryRef = doc(workspaceRef, "categories", categoryId);

      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(categoryRef, updatedData);
      return updatedData;
    } catch (error) {
      console.error("Update category error:", error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const categoryRef = doc(workspaceRef, "categories", categoryId);

      await deleteDoc(categoryRef);
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  };

  const getCategoryById = async (categoryId) => {
    try {
      if (!currentWorkspace) {
        throw new Error("No current workspace");
      }

      const workspaceRef = doc(db, "workspaces", currentWorkspace.id);
      const categoryRef = doc(workspaceRef, "categories", categoryId);
      const categorySnap = await getDoc(categoryRef);

      if (categorySnap.exists()) {
        return { id: categorySnap.id, ...categorySnap.data() };
      } else {
        throw new Error("Category not found");
      }
    } catch (error) {
      console.error("Get category error:", error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        ensureDefaultCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within CategoryProvider");
  }
  return context;
};
