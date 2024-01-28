// const jwt = require('jsonwebtoken');
const User = require("../model/userModel");
const { verifyToken } = require("./generateJWT");
const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const val = await verifyToken(token);
      if (val === 'invalid token') {
        return res
          .status(401)
          .json({ status: 401, message: "Invalid Token", data: null });
      }else if(val==='jwt expired'){
        return res
          .status(401)
          .json({ status: 401, message: "Expired Token", data: null });
      }

      req.user = await User.findById(val.id).select("-password");

      next();
    } else {
        return res
        .status(401)
        .json({ status: 401, message: "Unauthorized", data: null });
    }
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = protect;
