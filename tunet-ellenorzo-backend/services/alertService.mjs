import { db, messaging } from '../config/firebase.mjs';

export async function sendScheduledAlerts() {
  const now = new Date();
  now.setHours(now.getHours() + 2);
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  const snapshot = await db.collection('alerts').where('isActive', '==', true).get();
  const messages = [];

  snapshot.forEach(doc => {
    const alert = doc.data();
    const freq = alert.frequency;
    const times = alert.times;
    let shouldSend = false;
    console.log("current time:")
    console.log(currentTime)
    if (times.includes(currentTime)) {
      shouldSend=true;
    }
    console.log("alert time:")
    console.log(alert.times)
    if (shouldSend) {
      console.log("sending")
      console.log(alert.fcmToken)
      messages.push({
        token: alert.fcmToken,
        notification: {
          title: 'Gyógyszer szedés emlékeztető',
          body: alert.name
        }
      });
    }
  });

  if (messages.length > 0) {
    for (const message of messages) {
        const response = await messaging.send(message);
        console.log(`kikuldve: ${response}`);
    }
  }
}
