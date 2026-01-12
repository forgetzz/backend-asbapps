const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db, admin } = require("../firebase/firbaseConfig");

const router = express.Router();

router.post("/asbStore", VeryfikasiToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, amount, items , pembeli} = req.body;

    if (!name || !amount || !items || !pembeli) {
      return res.status(400).json({
        success: false,
        message: "Tolong isi semua data",
      });
    }

    const userRef = db.collection("users").doc(uid);
    const storeRef = db.collection("asbStore").doc(); // pre-generate ID

    await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new Error("User tidak ditemukan");
      }

      const saldo = userSnap.data().redemption || 0;

      if (saldo < amount) {
        throw new Error("Saldo redemption tidak mencukupi");
      }

      // ⬇️ Kurangi saldo
      transaction.update(userRef, {
        redemption: saldo - amount,
      });

      // ⬇️ Simpan transaksi store
      transaction.set(storeRef, {
        uid,
        name,
        pembeli,
        amount,
        items,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({
      success: true,
      message: "Sukses, pembelian merchandise akan segera diproses",
    });
  } catch (error) {
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

module.exports = router;
