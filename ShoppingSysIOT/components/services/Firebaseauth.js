// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { initializeAuth } from "firebase/auth";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

let analytics;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJE9zxxHmo66Pr2hQYSorLAwTZIFnwKvk",
  authDomain: "beaconiot.firebaseapp.com",
  projectId: "beaconiot",
  storageBucket: "beaconiot.firebasestorage.app",
  messagingSenderId: "136051041270",
  appId: "1:136051041270:web:efdf28928a593c3fe69dd7",
  measurementId: "G-WKK2Y3T38W"
};

let auth;
// Initialize Firebase
const app = initializeApp(firebaseConfig);

auth = initializeAuth(app);

export default auth;