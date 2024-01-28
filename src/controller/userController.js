const User = require("../model/userModel");
const generateOTP = require("../helpingfunctions/generateOTP");
const validator = require("validator");
const sendEmail = require("../helpingfunctions/sendEmail");
const {generateToken} = require("../helpingfunctions/generateJWT");

const signUp = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: 400,
        message: "Name is required",
        data: null,
      });
    } else if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Email Format",
        data: null,
      });
    } else if (!password || password.length < 8) {
      return res.status(400).json({
        status: 400,
        message: "Password length should be 8 or more",
        data: null,
      });
    }

    // Check if user exists or is not verified
    email = email.toLowerCase();
    const existingUser = await User.findOne({ email });
    //If user exists and verified also
    if (existingUser && existingUser.isVerified) {
        return res.status(200).json({
          status: 200,
          message: "User has already exists",
          data: null,
        });
      }
  
    // If user exists also not verified
    if (existingUser && !existingUser.isVerified) {
      const isSent = await sendEmail(email, 4);
      return res.status(200).json({
        status: 200,
        message: "OTP sent successfully",
        data: isSent,
      });
    }

    // If user does not exist, create a new user
    if (!existingUser) {
      const userData = { name, email, password };
      const newUser = await User.create(userData);

      if (newUser) {
        const isSent = await sendEmail(email, 4);
        return res.status(201).json({
          status: 201,
          message: "OTP sent successfully",
          data: isSent,
        });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Unable to signup",
      data: null,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    let { otp, email } = req.body;
    // Validate input
    if (!otp) {
      return res.status(400).json({
        status: 400,
        message: "OTP is required",
        data: null,
      });
    } else if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Email Format",
        data: null,
      });
    }
    email = email.toLowerCase();
    const user = await User.findOne({ email });
    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const storedOTP = user.OTP;
    if (!storedOTP || storedOTP.otp !== otp) {
      return res.status(400).json({
        status: 400,
        message: "Invalid OTP",
        data: null,
      });
    }

    const currentDateTime = new Date();
    const expirationTime = new Date(storedOTP.expiresIn);

    if (currentDateTime > expirationTime) {
      return res.status(400).json({
        status: 400,
        message: "OTP has expired",
        data: null,
      });
    }

    // Verify the user if not already verified
    if (!user.isVerified) {
      const verifyUser = await User.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true, projection: { password: 0 } }
      );

      if (verifyUser) {
        return res.status(200).json({
          status: 200,
          message: "Email Verified",
          data: verifyUser,
        });
      }
    }

    // If the user is already verified its just for the forgot password
    return res.status(200).json({
      status: 200,
      message: "Email Verified",
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Unable to verify OTP",
      data: err.message,
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    let { email } = req.body;
    
    if (email === undefined) {
      return res.status(404).json({
        status: 404,
        message: "Email is required",
        data: null,
      });
    } else if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Email Format",
        data: null,
      });
    } else {
        email = email.toLowerCase();
      const userExists = await User.findOne({ email });
      if ((userExists != undefined) | null) {
        await sendEmail(email, 4);
        res.status(200).json({
          status: 200,
          message: "OTP sent successfully",
          data: null,
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "User not found",
          data: null,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unable to resend OTP",
      data: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    if (email === undefined) {
      return res.status(404).json({
        status: 404,
        message: "Email is required",
        data: null,
      });
    } else if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Email Format",
        data: null,
      });
    } else if (password === undefined) {
      return res.status(400).json({
        status: 404,
        message: "Password is required",
        data: null,
      });
    } else {
        email = email.toLowerCase();
      const user = await User.findOne({ email });
      if (
        user &&
        user.isVerified === true &&
        (await user.matchPassword(password))
      ) {
        const genJWT = await generateToken(user._id, "7200s");

        return res.status(200).json({
          status: 200,
          message: "Login Successfully",
          data: {user,token:genJWT}
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Invalid credentials",
          data: null,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unable to login",
      data: err.message,
    });
  }
};
module.exports = { signUp, verifyOTP, resendOTP, loginUser };
