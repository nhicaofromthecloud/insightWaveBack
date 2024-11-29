const jwt = require("jsonwebtoken");

function createToken(_id) {
  return jwt.sign({ _id }, process.env.SECRET_JWT, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

module.exports = createToken;
