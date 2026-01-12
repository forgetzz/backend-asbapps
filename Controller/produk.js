const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db } = require("../firebase/firbaseConfig");
const admin = require("firebase-admin");
const router = express.Router();

router.post("/produk", VeryfikasiToken, async (req, res) => {
  const { items, mitra, mitrauid } = req.body;
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const totalQty = items.reduce((a, b) => a + b.qty, 0);
    const totalPrice = items.reduce((a, b) => a + b.qty * b.price, 0);

    const userRef = db.collection("users").doc(userId);
    const mitraRef = db.collection("users").doc(mitrauid);
    const produkRef = db.collection("produk").doc();

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      const mitraSnap = await t.get(mitraRef);

      if (!userSnap.exists || !mitraSnap.exists) {
        throw new Error("User / Mitra tidak ditemukan");
      }

      const userData = userSnap.data();
      const mitraData = mitraSnap.data();

      let userPoin = userData.poin || 0;
      let mitraPoin = mitraData.poin || 0;
      let redemption = userData.redemption || 0;
      let royalty = userData.Royalty || 0;
      const userSaldo = userData.saldo || 0;

      /* =========================
         💰 CEK SALDO
      ========================== */
      if (userSaldo < totalPrice) {
        throw new Error("Saldo tidak cukup");
      }

      const newSaldo = userSaldo - totalPrice;

      /* =========================
         🔁 POIN UTAMA
      ========================== */
      if (userData.role === mitraData.role) {
        if (mitraPoin < totalQty) {
          throw new Error("Poin mitra tidak cukup");
        }

        userPoin += totalQty;
        mitraPoin -= totalQty;
        t.update(mitraRef, { poin: mitraPoin });
      } else {
        userPoin += totalQty;
      }

      /* =========================
         👑 ROYALTI BUYBACK
      ========================== */
      
      if (
        userData.buyback === true &&
        userData.referal === mitraData.username &&
        userData.aktif === mitraData.aktif
      ) {
        const royaltiPoin = totalQty * 500;
        const modulus = Math.floor(royaltiPoin * 0.2);
        const royaltiRedemption = royaltiPoin - modulus

        royalty += royaltiRedemption;
        redemption += modulus;
      }

      /* =========================
         🔄 UPDATE USER
      ========================== */
      t.update(userRef, {
        poin: userPoin,
        Royalty: royalty,
        buyBack: true,
        redemption: redemption,
        saldo: newSaldo,
      });

      /* =========================
         🧾 SIMPAN PRODUK
      ========================== */
      t.set(produkRef, {
        userId,
        mitra,
        mitrauid,
        items,
        totalQty,
        totalPrice,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.json({
      success: true,
      message: "Produk, poin, royalti & redemption berhasil diproses",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
