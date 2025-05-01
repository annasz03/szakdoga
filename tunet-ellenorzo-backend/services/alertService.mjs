import { db, messaging } from '../config/firebase.mjs';

export async function sendScheduledAlerts() {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  const currentDay = now.getDate();
  const currentWeekday = now.getDay();

  try {
    const snapshot = await db.collection('alerts')
      .where('isActive', '==', true)
      .get();

    const messages = [];

    snapshot.forEach(doc => {
      const alert = doc.data();
      const freq = alert.frequency;
      const times = alert.times || [];

      let shouldSend = false;

      if (times.includes(currentTime)) {
        switch (freq) {
          case 'Naponta egyszer':
            shouldSend = times.length === 1;
            break;
          case 'Naponta kétszer':
            shouldSend = times.length === 2;
            break;
          case 'Naponta háromszor':
            shouldSend = times.length === 3;
            break;
          case 'Hetente egyszer':
            shouldSend = currentWeekday === 1;
            break;
          case 'Havonta egyszer':
            shouldSend = currentDay === 1;
            break;
          default:
            shouldSend = false;
        }
      }

      if (shouldSend) {
        messages.push({
          token: alert.fcmToken,
          notification: {
            title: 'Emlékeztető',
            body: alert.name
          },
          android: {
            notification: {
              priority: 'high',
            },
          },
        });
      }
    });

    if (messages.length > 0) {
      for (const message of messages) {
        try {
          const response = await messaging.send(message);
          console.log(`sent: ${response}`);
        } catch (error) {
          console.error('error while sending out alert', error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}
