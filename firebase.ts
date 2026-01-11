
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
 apiKey: "AIzaSyDVJBRRSw2lFcX9kYIt6Cru2OoTIa2m0lQ",
 authDomain: "lioninvest-102c9.firebaseapp.com",
 databaseURL: "https://lioninvest-102c9-default-rtdb.firebaseio.com",
 projectId: "lioninvest-102c9",
 storageBucket: "lioninvest-102c9.firebasestorage.app",
 messagingSenderId: "839381678096",
 appId: "1:839381678096:web:11b968b5724e94d378f295"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
