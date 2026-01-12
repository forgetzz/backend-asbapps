const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
app.use(express.json());

// register
const singup = require("./Register/register");
app.use(singup);

// routes
const loginRouter = require("./routes/login");
app.use(loginRouter);

// produkBuy
const produk = require("./Controller/produk");
app.use(produk);

// buypin
const buypin = require("./Controller/buypin");
app.use(buypin);

// handleAprrove
const pesanan = require("./Controller/pesanan");
app.use(pesanan);

// pinAktivasi
const aktivasipin = require("./Controller/aktivasipin");
app.use(aktivasipin);

// topup
const topup = require("./Controller/Topup");
app.use(topup);

// Withdraw
const wd = require("./Controller/withdraw");
app.use(wd);

// asbStore
const store = require("./asbstore/buy");
app.use(store);

// notifikasi
const notif = require("./notifikasi/GlobalNotifikasi");
app.use(notif);

// adminPage
const admin = require("./admin/ConfirmTopup");
app.use(admin);

// history Store
const historyStore = require("./asbstore/asbhistory");
app.use(historyStore);

// transfer
const tf = require("./Controller/tf");
app.use(tf);

// / Approve Topup
const approveTopup = require('./admin/ConfirmTopup')
app.use(approveTopup)

const approveWithdraw = require("./admin/approveWithdraw")
app.use(approveWithdraw)
// server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
