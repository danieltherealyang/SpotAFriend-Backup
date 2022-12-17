// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1iogSnyFJUyoDqlYbXsgaVyvvUQhUVrQ",
  authDomain: "spotafriend-test.firebaseapp.com",
  databaseURL: "https://spotafriend-test-default-rtdb.firebaseio.com",
  projectId: "spotafriend-test",
  storageBucket: "spotafriend-test.appspot.com",
  messagingSenderId: "557938053371",
  appId: "1:557938053371:web:e3090788a6ea3d144de05e",
  measurementId: "G-4VDJX3LC6V"
};

//Get a reference to the storage service, which is used to create references in your storage bucket

// Create a storage reference from our storage service

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const db = getDatabase();
