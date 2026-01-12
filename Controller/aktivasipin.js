const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase/firbaseConfig");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");

module.exports = router.post(
  "/aktivasiPin",
  VeryfikasiToken,
  async (req, res) => {
    const { pin } = req.body;
    const userId = req.user?.uid;

    if (!pin || pin === 0) {
      return res.status(401).json({ erorr: "field tidak boleh kosong" });
    }

    const result = pin - 1;

    const expiredAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
    );

    try {
      await db.collection("users").doc(userId).set(
        {
          pin: result,
          aktif: true,
          expiredAt,
        },
        {
          merge: true,
        }
      );
      res.status(200).json({ sukses: "berhasil ubah data" });
    } catch {
      return res.status().json({ erorr: "server erorr kak" });
    }
  }
);
