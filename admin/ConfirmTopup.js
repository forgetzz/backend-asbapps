const express = require("express");
const { db, admin } = require("../firebase/firbaseConfig");
const router = express.Router();

router.post("/approveTopup", async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await db.runTransaction(async (tx) => {
      const topupRef = db.collection("topup").doc(id);
      const topupSnap = await tx.get(topupRef);

      if (!topupSnap.exists) {
        throw new Error("Withdraw tidak ditemukan");
      }

      const topup = topupSnap.data();

      if (topup.status !== "pending") {
        throw new Error("Withdraw sudah diproses");
      }

      const userRef = db.collection("users").doc(topup.uid);
      const userSnap = await tx.get(userRef);

      if (!userSnap.exists) {
        throw new Error("User tidak ditemukan");
      }

      if (status === "sukses") {
        const amount = topup.amount;
        tx.update(userRef, {
          saldo: admin.firestore.FieldValue.increment(amount),
        });
        tx.update(topupRef, {
          status,
          amount: amount,
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    return res.json({
      success: true,
      message: "topup berhasil diproses",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Kesalahan server",
    });
  }
});

module.exports = router;
