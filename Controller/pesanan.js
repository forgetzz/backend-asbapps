const express = require("express");
const VeryfikasiToken = require("../middleware/VeryfikasiToken");
const { db } = require("../firebase/firbaseConfig");
const router = express.Router();

module.exports = router.put("/pesanan", VeryfikasiToken, async (req, res) => {
  const { status , uid} = req.body;


  if (!status || !uid) {
    return res.status(400).json({ error: "Status wajib diisi" });
  }

  try {
    await db.collection("produk").doc(uid).update({
      status,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Status berhasil diupdate",
    });
  } catch (err) {
    res.status(500).json({
      error: "Gagal update status",
    });
  }
});
