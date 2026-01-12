const admin = require("firebase-admin");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  throw new Error("❌ ENV FIREBASE_SERVICE_ACCOUNT tidak ditemukan!");
}

let serviceAccount = JSON.parse(serviceAccountString);

// perbaiki private_key agar formatnya benar
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Inisialisasi Firebase Admin
if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

module.exports = { admin, db };
