import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications.');
  }

  const { userId, title, body } = data;

  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData || !userData.fcmToken) {
    throw new functions.https.HttpsError('failed-precondition', 'User does not have a valid FCM token.');
  }

  const message = {
    notification: {
      title,
      body,
    },
    token: userData.fcmToken,
  };

  try {
    await admin.messaging().send(message);
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'Error sending notification.');
  }
});