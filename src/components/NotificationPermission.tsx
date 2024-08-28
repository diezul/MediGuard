import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { subscribeUserToPush, unsubscribeUserFromPush } from '../utils/pushNotifications';

const NotificationPermission: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.notificationsEnabled === undefined && Notification.permission === 'default') {
          setOpen(true);
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    const permission = await Notification.requestPermission();
    const user = auth.currentUser;
    if (user) {
      if (permission === 'granted') {
        await subscribeUserToPush();
        await setDoc(doc(db, 'users', user.uid), {
          notificationsEnabled: true
        }, { merge: true });
        new Notification('Notifications Enabled', {
          body: 'You will now receive medication reminders.',
        });
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          notificationsEnabled: false
        }, { merge: true });
      }
    }
    setOpen(false);
  };

  const handleDecline = async () => {
    const user = auth.currentUser;
    if (user) {
      await unsubscribeUserFromPush();
      await setDoc(doc(db, 'users', user.uid), {
        notificationsEnabled: false
      }, { merge: true });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleDecline}>
      <DialogTitle>Enable Notifications</DialogTitle>
      <DialogContent>
        <Typography>
          Would you like to receive push notifications for medication reminders? This will allow us to send you timely reminders for your treatments.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDecline} color="primary">
          No, thanks
        </Button>
        <Button onClick={handleEnable} color="primary" variant="contained">
          Yes, enable notifications
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPermission;