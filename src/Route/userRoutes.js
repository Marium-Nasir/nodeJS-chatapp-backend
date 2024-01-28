const router = require('express').Router();
const { signUp, verifyOTP, resendOTP, loginUser } = require('../controller/userController');

/**************SignUP user **************/
router.post('/signup',signUp);

/**************verify email ************/
router.post('/verify',verifyOTP);

/*************resend OTP **************/
router.post('/resendotp',resendOTP);

/*************login user***************/
router.post('/login',loginUser);

module.exports = router;
