import { useState, useEffect } from 'react';
import { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthState {
  user: FirebaseUser | null;
  userRole: string | null;
  loading: boolean;
  profileComplete: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userRole: null,
    loading: true,
    profileComplete: false,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          setAuthState({
            user,
            userRole: userData?.role || "user",
            loading: false,
            profileComplete: !!userData?.fullName && !!userData?.phoneNumber,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthState({
            user,
            userRole: null,
            loading: false,
            profileComplete: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          userRole: null,
          loading: false,
          profileComplete: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};