import { db } from '../config/firebase.mjs';

export async function loadSymptomTranslations() {
  const snapshot = await db.collection('symptoms').get();
  const translationMap = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.hu) translationMap[data.hu] = doc.id;
    if (data.en) translationMap[data.en] = doc.id;
  });

  return translationMap;
}
