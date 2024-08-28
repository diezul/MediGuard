import React, { useEffect, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const NotificationManager: React.FC = () => {
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.notificationsEnabled === undefined) {
          setShowSnackbar(true);
        }
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setShowSnackbar(false);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        notificationsEnabled: permission === 'granted'
      }, { merge: true });

      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive medication reminders.',
        });
      }
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={showSnackbar}
      message="Enable notifications to receive medication reminders"
      action={
        <Button color="secondary" size="small" onClick={requestPermission}>
          Enable
        </Button>
      }
    />
  );
};

export default NotificationManager;