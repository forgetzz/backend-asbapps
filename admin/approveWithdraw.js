const express = require("express");
const { db, admin } = require("../firebase/firbaseConfig");
const router = express.Router();

router.post("/approveWithdraw", async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await db.runTransaction(async (tx) => {
      const withdrawRef = db.collection("Withdraw").doc(id);
      const withdrawSnap = await tx.get(withdrawRef);

      if (!withdrawSnap.exists) {
        throw new Error("Withdraw tidak ditemukan");
      }

      const withdraw = withdrawSnap.data();

      if (withdraw.status !== "pending") {
        throw new Error("Withdraw sudah diproses");
      }

      const userRef = db.collection("users").doc(withdraw.uid);
      const userRefAdmin = db
        .collection("users")
        .doc("snizVBOfEbNlnYl473IQ19sNc1T2");
      const userSnap = await tx.get(userRef);

      if (!userSnap.exists) {
        throw new Error("User tidak ditemukan");
      }

      if (status === "sukses") {
        const amount = withdraw.amount;
        const saldo = userSnap.data().saldo;

        const ppn = amount * 0.2;
        const total = amount - ppn;

        if (saldo < total) {
          throw new Error("Saldo tidak cukup");
        }

        tx.update(userRef, {
          saldo: admin.firestore.FieldValue.increment(-amount),
        });
        tx.update(withdrawRef, {
          status,
          amount: total,
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.update(userRefAdmin, {
          saldo: admin.firestore.FieldValue.increment(ppn),
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    return res.json({
      success: true,
      message: "Withdraw berhasil diproses",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Kesalahan server",
    });
  }
});

module.exports = router;
