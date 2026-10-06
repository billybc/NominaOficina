import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAt2Y7Jn7fDQBfxhAJ5Jco70fpvTYeyQVo",
  authDomain: "turnosoficina-17fed.firebaseapp.com",
  projectId: "turnosoficina-17fed",
  storageBucket: "turnosoficina-17fed.appspot.com",
  messagingSenderId: "378553383601",
  appId: "1:378553383601:web:242d049cd0399ad59d0090",
  databaseURL: "https://turnosoficina-17fed-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, onValue };