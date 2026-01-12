const { admin } = require("../firebase/firbaseConfig");

module.exports = async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;
    req.uid = decoded.uid;
    req.email = decoded.email;

    next();
  } catch (err) {
    console.log("VERIFY TOKEN ERROR:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};
