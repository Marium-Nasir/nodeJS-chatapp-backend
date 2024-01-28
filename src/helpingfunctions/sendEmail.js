const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require('../model/userModel');
const generateOTP = require('./generateOTP');

const sendinblue = new SibApiV3Sdk.TransactionalEmailsApi();
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.sendInBlueApiKey;

const apiInstance = new SibApiV3Sdk.ContactsApi();

const addContactToBrevo = async (email) => {
    let createContact = new SibApiV3Sdk.CreateContact();
    createContact = { 'email' : email };
    await apiInstance.createContact(createContact).then(function(data) {
      // console.log('API called successfully. Returned data: ' + data);
    }, function(error) {
      // console.error(error);
    });
};

const sendEmail = async (email,templateId) => {
    const otp = await generateOTP()
    const sendinblueData = new SibApiV3Sdk.SendSmtpEmail();
    sendinblueData.to = [{ email: email }];
    sendinblueData.templateId = templateId;
    sendinblueData.params = {
      otp: otp
    };
    try {
      await addContactToBrevo(email);
      const sendinblueResponse = await sendinblue.sendTransacEmail(sendinblueData)
      // console.log('SendinBlue Email Sent:', sendinblueResponse);
      const time = new Date();
      time.setMinutes(time.getMinutes() + 2);
      const user = await User.findOneAndUpdate({email},{OTP:{otp,expiresIn:time}},{ new: true, projection: { password: 0 } });
      return user
    } catch (error) {
      // console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  };

  module.exports = sendEmail;