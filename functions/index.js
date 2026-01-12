const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
exports.autoExpireWrite = onSchedule(
  {
    schedule: "every day 01:00",
    timeZone: "Asia/Jakarta",
    region: "asia-southeast1",
  },
  async () => {
    const now = admin.firestore.Timestamp.now();

    const snap = await admin.firestore()
      .collection("users")
      .where("aktif", "==", true)
      .where("expiredAt", "<=", now)
      .get();

    if (snap.empty) return;

    const batch = admin.firestore().batch();
    snap.docs.forEach(doc => {
      batch.update(doc.ref, { aktif: false });
    });

    await batch.commit();
  }
);

