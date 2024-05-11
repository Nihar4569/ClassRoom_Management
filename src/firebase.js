// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBugUik4-OnhoaucKsjjag-LY3fb8DiapM",
  authDomain: "classroomsoa.firebaseapp.com",
  projectId: "classroomsoa",
  storageBucket: "classroomsoa.appspot.com",
  messagingSenderId: "711705546699",
  appId: "1:711705546699:web:5fc76941ccc3b08576b04e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);