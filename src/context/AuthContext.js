import React, { createContext, useContext, useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../config/firebase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const onboardingStatus = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );
        setHasCompletedOnboarding(onboardingStatus === "true");
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInAnonymouslyHandler = async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      throw error;
    }
  };

  const completeOnboarding = async (userData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Save user data to Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        createdAt: serverTimestamp(),
        isAnonymous: true,
        email: null,
        name: userData.name,
        avatarUrl: userData.avatarUrl || null,
        userTier: "free",
      });

      // Mark onboarding as completed
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Complete onboarding error:", error);
      throw error;
    }
  };

  const signOutHandler = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("hasCompletedOnboarding");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        hasCompletedOnboarding,
        signInAnonymously: signInAnonymouslyHandler,
        completeOnboarding,
        signOut: signOutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
