import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext({});

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      // Reset state when user logs out
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      const workspacesRef = collection(db, "workspaces");
      const q = query(workspacesRef, where("userId", "==", user.uid));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const workspacesList = [];
        snapshot.forEach((doc) => {
          workspacesList.push({ id: doc.id, ...doc.data() });
        });

        setWorkspaces(workspacesList);

        // Load current workspace from AsyncStorage or set first one
        const savedWorkspaceId = await AsyncStorage.getItem(
          "currentWorkspaceId"
        );
        if (
          savedWorkspaceId &&
          workspacesList.find((w) => w.id === savedWorkspaceId)
        ) {
          setCurrentWorkspace(
            workspacesList.find((w) => w.id === savedWorkspaceId)
          );
        } else if (workspacesList.length > 0) {
          setCurrentWorkspace(workspacesList[0]);
          await AsyncStorage.setItem(
            "currentWorkspaceId",
            workspacesList[0].id
          );
        } else {
          // No workspaces exist - set currentWorkspace to null
          setCurrentWorkspace(null);
        }

        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Load workspaces error:", error);
      setIsLoading(false);
    }
  };

  const createWorkspace = async (workspaceName) => {
    try {
      if (!user) {
        throw new Error("No authenticated user");
      }

      const workspaceId = `${user.uid}_${Date.now()}`;
      const workspaceRef = doc(db, "workspaces", workspaceId);

      const workspaceData = {
        name: workspaceName,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        currency: "USD",
        isActive: true,
      };

      await setDoc(workspaceRef, workspaceData);

      // Set as current workspace
      const newWorkspace = { id: workspaceId, ...workspaceData };
      setCurrentWorkspace(newWorkspace);
      await AsyncStorage.setItem("currentWorkspaceId", workspaceId);

      return newWorkspace;
    } catch (error) {
      console.error("Create workspace error:", error);
      throw error;
    }
  };

  const switchWorkspace = async (workspaceId) => {
    try {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        await AsyncStorage.setItem("currentWorkspaceId", workspaceId);
      }
    } catch (error) {
      console.error("Switch workspace error:", error);
      throw error;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        createWorkspace,
        switchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};
