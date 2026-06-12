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
      // Local mode: retrieve saved guest user session
      const savedGuest = localStorage.getItem("guestUser");
      if (savedGuest) {
        try {
          setCurrentUser(JSON.parse(savedGuest));
        } catch (e) {
          localStorage.removeItem("guestUser");
        }
      }
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
      setCurrentUser(null);
      localStorage.removeItem("guestUser");
      return Promise.resolve();
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

  const loginAsGuest = (name, email = "guest@offline.local") => {
    const guestUser = {
      uid: `guest-${Date.now()}`,
      displayName: name || "Guest User",
      email: email
    };
    setCurrentUser(guestUser);
    localStorage.setItem("guestUser", JSON.stringify(guestUser));
    return Promise.resolve(guestUser);
  };

  const value = {
    currentUser,
    isFirebase: isFirebaseConfigured,
    signup,
    login,
    loginWithGoogle,
    loginAsGuest,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
