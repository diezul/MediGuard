import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY'; // You'll need to generate this

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    await setDoc(doc(db, 'users', user.uid), {
      pushSubscription: JSON.stringify(subscription)
    }, { merge: true });

    console.log('User subscribed to push notifications');
  } catch (err) {
    console.error('Failed to subscribe the user: ', err);
  }
}

export async function unsubscribeUserFromPush() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }

    await setDoc(doc(db, 'users', user.uid), {
      pushSubscription: null
    }, { merge: true });

    console.log('User unsubscribed from push notifications');
  } catch (err) {
    console.error('Failed to unsubscribe the user: ', err);
  }
}

export async function sendPushNotification(userId: string, title: string, body: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  const pushSubscription = userData?.pushSubscription;

  if (pushSubscription) {
    // You'll need to implement a server-side function to send the actual push notification
    // This could be a Firebase Cloud Function or a custom server endpoint
    await fetch('/api/send-push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: JSON.parse(pushSubscription),
        title,
        body,
      }),
    });
  }
}