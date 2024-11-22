// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase} from "firebase/database";
import { API_KEY } from "$env/static/private";
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "firestrokedynamics.firebaseapp.com",
  databaseURL: "https://firestrokedynamics-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "firestrokedynamics",
  storageBucket: "firestrokedynamics.firebasestorage.app",
  messagingSenderId: "175385878227",
  appId: "1:175385878227:web:5802cd0717825ea9063e26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };