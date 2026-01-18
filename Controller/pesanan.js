const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db, admin } = require("../firebase/firbaseConfig");
const router = express.Router();

module.exports =router.put("/pesanan", VeryfikasiToken, async (req, res) => {
  const { status, uid: orderId, totalPrice } = req.body;

  if (!status || !orderId) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  if (status === "sukses" && (!totalPrice || totalPrice <= 0)) {
    return res.status(400).json({ error: "Total price tidak valid" });
  }

  try {
    const userUid = req.user.uid; // 🔥 UID DARI TOKEN

    const orderRef = db.collection("produk").doc(orderId);
    const userRef = db.collection("users").doc(userUid);

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) {
        throw new Error("User tidak ditemukan");
      }

      const currentSaldo = userSnap.data().saldo || 0;

      // 1️⃣ Update status pesanan
      t.update(orderRef, {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2️⃣ Tambah saldo jika sukses
      if (status === "sukses") {
        t.update(userRef, {
          saldo: currentSaldo + totalPrice,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message:
        status === "sukses"
          ? "Pesanan sukses, saldo bertambah"
          : "Pesanan diperbarui",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Gagal update pesanan",
    });
  }
});
