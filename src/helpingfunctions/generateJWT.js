require("dotenv").config();
const JWT = require("jsonwebtoken");

const generateToken = async (val, expireTime) => {
  try {
    return await JWT.sign({ id: val }, process.env.jwtKey, {
      expiresIn: expireTime,
    });
  } catch (err) {
    console.log(err);
  }
};

const verifyToken = async (token) => {
  try {
    const verify = await JWT.verify(token, process.env.jwtKey);
    return verify;
  } catch (err) {
    return err.message;
  }
};
module.exports = { generateToken, verifyToken };
