const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db, admin } = require("../firebase/firbaseConfig");
const router = express.Router();

module.exports = router.post("/topup", VeryfikasiToken, async (req, res) => {
  const { amount, uid, name, bank, norek } = req.body;

  if (!amount || !uid || !name || !norek || !bank) {
    return res.status(401).json({ erorr: "isi semua field" });
  }

  try {
    await db.collection("topup").add(
      {
        amount,
        name,
        uid,
        bank,
        norek,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    res.json({
      success: true,
      message: "Topup sukses, data anda sedang diproses",
    });
  } catch {
    res.status(500).json({ erorr: "server erorr" });
  }
});
