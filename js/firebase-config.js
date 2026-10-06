import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLzrMr_kWLL_0t9Y-VBlORR29a0noCrk",
  authDomain: "turnos-oficina.firebaseapp.com",
  databaseURL: "https://turnos-oficina-default-rtdb.firebaseio.com", // Se genera al activar la Realtime Database
  projectId: "turnos-oficina",
  storageBucket: "turnos-oficina.firebasestorage.app",
  messagingSenderId: "143636623453",
  appId: "1:143636623453:web:1c325ace03ebeabed5db4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, onValue };