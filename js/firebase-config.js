import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLzrwMr_kWlL_0t9Y-VBlORR29aOnoCRk",
  authDomain: "turnos-oficina.firebaseapp.com",
  databaseURL: "https://turnos-oficina-default-rtdb.firebaseio.com", // Se genera al activar la Realtime Database
  projectId: "turnos-oficina",
  storageBucket: "turnos-oficina.firebasestorage.app",
  messagingSenderId: "143636623453",
  appId: "1:143636623453:web:1c325ace03ebeeabed5db4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export {
  ref,
  set,
  onValue,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
};