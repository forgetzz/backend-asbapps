const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db, admin } = require("../firebase/firbaseConfig");
const { Expo } = require("expo-server-sdk");
const router = express.Router();
const expo = new Expo()
module.exports = router.post("/pushNotif", async (req, res) => {
  try {
    const { isGlobal, text, uid , title} = req.body;

    if (!text || !title) {
      return res.status(400).json({
        ok: false,
        message: "Text notifikasi wajib diisi",
      });
    }

    let snapshot;

    if (isGlobal) {
      snapshot = await db
        .collection("global")
        .where("expoPushToken", "!=", null)
        .get();
    } else {
      if (!uid) {
        return res.status(400).json({
          ok: false,
          message: "uid required",
        });
      }

      snapshot = await db
        .collection("users")
        .where("uid", "==", uid)
        .limit(1)
        .get();
    }

    const tokens = snapshot.docs
      .map((d) => d.data().expoPushToken)
      .filter(Boolean);

    if (tokens.length === 0) {
      return res.status(200).json({
        ok: true,
        message: "Tidak ada token",
      });
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: title,
      body: text,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    res.status(200).json({
      ok: true,
      message: "Notifikasi berhasil dikirim",
      sent: tokens.length,
    });

  } catch (err) {
    console.error("pushNotif error:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
});
