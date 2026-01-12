const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db, admin } = require("../firebase/firbaseConfig");
const router = express.Router();

module.exports = router.post("/wd", VeryfikasiToken, async (req, res) => {
  const { amount, uid , bank, norek, name} = req.body;
  if (!amount || !uid || !bank || !norek || !name) {
    return res.json({ erorr: "isi semua field" });
  }

  try {
    await db.collection("Withdraw").add({
      amount,
      uid,
      norek,
      name,
      bank,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({
      success: true,
      message: "Withdraw berhasil dan akan diproses 1/24 jam",
    });
  } catch {
    res.json({
      success: false,
      message: "server erorr, periksa jaringan anda",
    });
  }
});
