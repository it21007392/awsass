import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Add storage if needed

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxuwfhzILpQpzIomYW4Ed0PMAmdrzAtI4",
  authDomain: "vcmhrms.firebaseapp.com",
  projectId: "vcmhrms",
  storageBucket: "vcmhrms.firebasestorage.app",
  messagingSenderId: "580493925695",
  appId: "1:580493925695:web:51b52dcd83da84c2bb478a",
  measurementId: "G-1C51M4NGEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Add this if you are using Firebase Storage

export { auth, db, storage };  // Export services you need
