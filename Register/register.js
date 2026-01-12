const express = require("express");
const { admin, db } = require("../firebase/firbaseConfig");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, name, alamat, role, username, referal, path, codepin, numberPhone } =
    req.body;

  if (!email || !password || !name || !alamat || !role || !username || !path || !codepin || !numberPhone) {
    return res.status(400).json({
      message: "Data wajib diisi lengkap",
    });
  }

  try {
    // 🔴 1. CEK NAME SUDAH ADA ATAU BELUM
    const nameSnap = await db
      .collection("users")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (!nameSnap.empty) {
      return res.status(400).json({
        message: "Nama sudah digunakan, silakan pakai nama lain",
      });
    }

    // 🔵 2. BUAT USER AUTH
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // 🔵 3. SIMPAN DATA USER
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      saldo: 0,
      redemption: 0,
      alamat,
      numberPhone,
      role,
      codepin,
      buyBack: false,
      username,
      referal,
      path,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Pendaftaran berhasil",
      uid: userRecord.uid,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Kesalahan server",
    });
  }
});

module.exports = router;
