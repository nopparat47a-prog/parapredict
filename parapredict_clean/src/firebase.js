import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDs3j3cWlfsWyA-DPImuVi4pNB6Msf4JQ",
  authDomain: "parapredict.firebaseapp.com",
  projectId: "parapredict",
  storageBucket: "parapredict.firebasestorage.app",
  messagingSenderId: "502051728628",
  appId: "1:502051728628:web:68047d8a4fa393048102a1",
  measurementId: "G-CFCHFV6FXF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
