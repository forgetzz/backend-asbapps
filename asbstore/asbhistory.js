const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db } = require("../firebase/firbaseConfig");
const { Timestamp } = require("firebase-admin/firestore");

const router = express.Router();

router.get("/history", VeryfikasiToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

    const uid = req.user.uid;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const snapshot = await db
      .collection("asbStore")
      .where("uid", "==", uid)
      .where("createdAt", ">=", Timestamp.fromDate(today))
      .where("createdAt", "<", Timestamp.fromDate(nextWeek))
      .orderBy("createdAt", "desc")
      .limit(6)
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("HISTORY ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil history order",
    });
  }
});

module.exports = router;
