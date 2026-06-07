import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, isFirebaseConfigured } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split("@")[0]
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const signup = (email, password) => {
    if (isFirebaseConfigured && auth) {
      return createUserWithEmailAndPassword(auth, email, password);
    } else {
      return Promise.reject(new Error("Authentication failed: Firebase is not configured."));
    }
  };

  const login = (email, password) => {
    if (isFirebaseConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    } else {
      return Promise.reject(new Error("Authentication failed: Firebase is not configured."));
    }
  };

  const logout = () => {
    if (isFirebaseConfigured && auth) {
      return signOut(auth);
    } else {
      return Promise.reject(new Error("Authentication failed: Firebase is not configured."));
    }
  };

  const loginWithGoogle = () => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(auth, provider);
    } else {
      return Promise.reject(new Error("Authentication failed: Firebase is not configured."));
    }
  };

  const loginAsGuest = () => {
    setCurrentUser({
      uid: "guest",
      email: "harsh.patel@ieee.org",
      displayName: "Harsh Patel"
    });
    return Promise.resolve();
  };

  const value = {
    currentUser,
    isFirebase: isFirebaseConfigured,
    signup,
    login,
    loginWithGoogle,
    logout,
    loginAsGuest,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

