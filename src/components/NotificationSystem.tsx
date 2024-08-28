import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

interface Treatment {
  id: string;
  medicationName: string;
  administrationTimes: string[];
}

const NotificationSystem: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const treatmentsQuery = query(
        collection(db, "treatments"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(treatmentsQuery, (snapshot) => {
        const newTreatments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Treatment[];
        setTreatments(newTreatments);
      });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      treatments.forEach((treatment) => {
        if (treatment.administrationTimes.includes(currentTime)) {
          showNotification(treatment.medicationName);
        }
      });
    };

    const intervalId = setInterval(checkNotifications, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [treatments]);

  const showNotification = (medicationName: string) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("MediGuard Reminder", {
          body: `It's time to take your ${medicationName}`,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("MediGuard Reminder", {
              body: `It's time to take your ${medicationName}`,
            });
          }
        });
      }
    }
  };

  return null; // This component doesn't render anything
};

export default NotificationSystem;