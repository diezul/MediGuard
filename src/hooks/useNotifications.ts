import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface Treatment {
  id: string;
  medicineName: string;
  times: string[];
}

export const useNotifications = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in');
      return;
    }

    const fetchNotificationPreference = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      setNotificationsEnabled(userData?.notificationsEnabled || false);
      console.log('Notifications enabled:', userData?.notificationsEnabled);
    };

    fetchNotificationPreference();

    const treatmentsQuery = query(
      collection(db, 'treatments'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(treatmentsQuery, (snapshot) => {
      const newTreatments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Treatment[];
      setTreatments(newTreatments);
      console.log('Treatments updated:', newTreatments);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) {
      console.log('Notifications are not enabled. Skipping check.');
      return;
    }

    const checkNotifications = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      console.log('Checking notifications at:', currentTime);

      treatments.forEach((treatment) => {
        console.log(`Checking treatment: ${treatment.medicineName}, times: ${treatment.times.join(', ')}`);
        if (treatment.times.includes(currentTime)) {
          console.log('Sending notification for:', treatment.medicineName);
          sendNotification('Medication Reminder', `It's time to take your ${treatment.medicineName}`);
        }
      });
    };

    const intervalId = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately on mount or treatments change

    return () => clearInterval(intervalId);
  }, [treatments, notificationsEnabled]);

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      console.log('Notification permission not granted');
    }
  };

  // Test function to trigger a notification immediately
  const testNotification = () => {
    console.log('Testing notification...');
    sendNotification('Test Notification', 'This is a test notification from MediGuard');
  };

  return { testNotification };
};