import React, { useEffect } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const NotificationComponent: React.FC = () => {
  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          notificationsEnabled: permission === 'granted'
        }, { merge: true });
      }
      console.log('Notification permission:', permission);
    };

    requestPermission();
  }, []);

  return null;
};

export default NotificationComponent;