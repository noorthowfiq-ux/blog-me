import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjxQgJcQpf5zSeusYCBVkTlrpxyr6iMs4",
  authDomain: "blog-portfolio-noor.firebaseapp.com",
  projectId: "blog-portfolio-noor",
  storageBucket: "blog-portfolio-noor.firebasestorage.app",
  messagingSenderId: "869027950531",
  appId: "1:869027950531:web:7904f3a689c05bd2a29776",
  measurementId: "G-KWNNNYWMC0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;