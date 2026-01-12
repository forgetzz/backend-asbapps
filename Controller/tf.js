// routes/transfer.js
const express = require("express");
const { db, admin } = require("../firebase/firbaseConfig");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");

const router = express.Router();

router.post("/transfer", VeryfikasiToken, async (req, res) => {
  const { toUid, amount, pengirim, penerima } = req.body;
  const uid = req.user.uid;

  if (!toUid || !amount || amount <= 0 || !uid || !pengirim || !penerima) {
    return res.status(400).json({ message: "Data tidak valid" });
  }
  if (amount <= 10000) {
    return res.status(400).json({ message: "Minimal Transfer Rp.11.000" });
  }

  const fromRef = db.collection("users").doc(uid);
  const toRef = db.collection("users").doc(toUid);

  try {
    await db.runTransaction(async (tx) => {
      const fromSnap = await tx.get(fromRef);
      const toSnap = await tx.get(toRef);

      if (!fromSnap.exists || !toSnap.exists) {
        throw "User tidak ditemukan";
      }

      const fromSaldo = fromSnap.data().saldo || 0;
      if (fromSaldo < amount) {
        throw "Saldo tidak cukup";
      }

      if (uid === toUid) {
        throw "Tidak boleh transfer ke diri sendiri";
      }
      tx.update(fromRef, {
        saldo: fromSaldo - amount,
      });

      tx.update(toRef, {
        saldo: (toSnap.data().saldo || 0) + amount,
      });

      tx.set(db.collection("transfers").doc(), {
        uid,
        penerima,
        pengirim,
        toUid,
        amount,
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.json({ success: true, message: "Transfer berhasil" });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
});

module.exports = router;
