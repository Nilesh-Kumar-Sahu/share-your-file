const express = require('express');
const File = require('../models/fileModel');
const fileController = require('./../controller/fileController');
const router = express.Router();

// Upload Rout
router.post('/', fileController.uploadUserFile, fileController.uploadFile);

router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;

  // Validate User
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: 'All fields are required except expiry.' });
  }

  try {
    // Get data from db
    const file = await File.findOne({ uuid: uuid });

    // This if(file.sender) condition checks if the senders email is used only one time
    if (file.sender) {
      return res.status(422).send({ error: 'Email already sent...' });
    }

    file.sender = emailFrom;
    file.receiver = emailTo;

    // Save in the database
    const response = await file.save();

    // send mail
    const sendMail = require('../services/mailService');

    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'inShare file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailTemplate')({
        emailFrom: emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + ' KB',
        expires: '24 hours',
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        return res.status(500).json({ error: 'Error in email sending.' });
      });
  } catch (err) {
    return res.status(500).send({ error: 'Something went wrong.' });
  }
});

module.exports = router;

/*
The HyperText Transfer Protocol (HTTP) 422 Unprocessable Entity response status code indicates that 
the server understands the content type of the request entity, and the syntax of the request entity is correct, 
but it was unable to process the contained instructions
*/
