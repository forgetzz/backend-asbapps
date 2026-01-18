const express = require("express");
const { db } = require("../firebase/firbaseConfig");
const router = express.Router();
const admin = require("firebase-admin");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
module.exports = router.post("/buypin", VeryfikasiToken, async (req, res) => {
  const { Pin, name } = req.body;
  const userId = req.user?.uid;

  if (!Array.isArray(Pin) || Pin.length === 0) {
    return res.status(400).json({ message: "Data PIN tidak valid" });
  }

  try {
    const totalQty = Pin.reduce((a, b) => a + b.qty, 0);
    const totalPrice = Pin.reduce((a, b) => a + b.qty * b.price, 0);

    const userRef = db.collection("users").doc(userId);
    const buyPinRef = db.collection("BuyPin").doc();

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);

      if (!userSnap.exists) {
        throw new Error("User tidak ditemukan");
      }

      const userData = userSnap.data();
      const saldoSekarang = userData.saldo || 0;
      const pinSekarang = userData.pin || 0;

      if (saldoSekarang < totalPrice) {
        throw new Error("Saldo tidak cukup");
      }

      // update user
      t.update(userRef, {
        saldo: saldoSekarang - totalPrice,
        pin: pinSekarang + 1,
      });

      // simpan history
      t.set(buyPinRef, {
        userId,
        name,
        totalPrice,
        totalQty,
        Pin,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.json({
      success: true,
      message: "PIN berhasil dibeli",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});
