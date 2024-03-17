// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqwoO2n5ZwHpS7VVGubtBcSse-GlfATzE",
  authDomain: "fireapp-caacb.firebaseapp.com",
  databaseURL: "https://fireapp-caacb.firebaseio.com",
  projectId: "fireapp-caacb",
  storageBucket: "fireapp-caacb.appspot.com",
  messagingSenderId: "833802276727",
  appId: "1:833802276727:web:5f5f178f4bef87e9ae9b72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(app, db)
export {app, db, getDocs}