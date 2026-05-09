// firebase.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCGNzegn9cIN3qWnaoNzARoJEH0QgHRsgI",
  authDomain: "rn-spark-app.firebaseapp.com",
  projectId: "rn-spark-app",
  storageBucket: "rn-spark-app.firebasestorage.app",
  messagingSenderId: "549185708201",
  appId: "1:549185708201:web:52a5768ee0510f917149b8",
  databaseURL:
    "https://rn-spark-app-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getDatabase(app);

export { app, auth, db };

