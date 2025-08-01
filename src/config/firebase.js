import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//   apiKey: "your-api-key",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "your-app-id",
// };

const firebaseConfig = {
  apiKey: "AIzaSyDxXjHtxUEyLtr4nieex3NPFlGnSgnExPI",
  authDomain: "spended-a35bd.firebaseapp.com",
  projectId: "spended-a35bd",
  storageBucket: "spended-a35bd.firebasestorage.app",
  messagingSenderId: "274979880801",
  appId: "1:274979880801:web:d7e2974b82beacb3338f20",
  measurementId: "G-WZKXZCJ5V5",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export { firebaseConfig };
