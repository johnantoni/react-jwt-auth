const jwt = require("jsonwebtoken");
const config = require("../config.json");

module.exports = (req, res, next) => {
  const authHeader = req.get("authorization");

  if (!authHeader) {
    res.status(401).json({
      message: "unauthorized"
    });
  }

  const token = authHeader.split(" ")[1]; // grab just the token
  jwt.verify(token, config.secret, (err, decoded) => {
    if (decoded) {
      req.token = decoded;
      next();
    } else {
      res.status(401).json({ message: "forbidden" });
    }
  });
};
