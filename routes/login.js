const express = require('express')
const router = express.Router()

router.post('/login', async (req, res) => {
  const { Username, Password } = req.body

  if (!Username || !Password) {
    return res.status(400).json({ error: 'Isi semua field' })
  }

  try {
    await auth.login
    res.json({ message: 'Login sukses' })
  } catch (err) {
    res.status(500).json({ error: 'Login gagal' })
  }
})

module.exports = router
