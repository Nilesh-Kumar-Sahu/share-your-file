const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/fileModel');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Set Storage Engine
let storageEng = multer.diskStorage(
  {
    // Where we want to upload our file
    destination: (req, file, cb) => cb(null, 'uploads/'),

    filename: (req, file, cb) => {

      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      
      cb(null, uniqueName);
    },
  }
);

// Init Upload
let upload = multer({
   storage:storageEng, 
   limits: { 
     fileSize: 1000000 * 100 
    } 
}).single('myfile' /*<-- field Name */); //100mb


// Upload Rout
router.post('/', (req, res) => {
  
  upload(req, res, async (err) => {
    // Validate request
    if (err) {
      res.status(400).json({
        status: 'fail',
        message: err
      });
    }
    
    // store file
    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });
    
    // store into database
    const response = await file.save();
    
    // Response->link
    res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    // http://localhost:5000/files/e31a5347-20e6-45eb-89b8-a470bbe4bf02

    /*
    console.log(req.file);
    {
      fieldname: 'myfile',
      originalname: 'Ganesh-Dev.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: 'uploads/',
      filename: '1627413865779-251591624.jpg',
      path: 'uploads\\1627413865779-251591624.jpg',
      size: 80540
    }
    */
  });
});


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
        emailFrom:emailFrom,
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


/*
try{
    // store file
    const file = new File({
    filename: req.file.filename,
    uuid: uuidv4(),
    path: req.file.path,
    size: req.file.size,
  });

  // store into database
  const response = await file.save();

  // Response->link
  res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
  // After above code link will show like this in the url bar
  // http://localhost:3000/files/54253gehwgdhsb-gdjcbj
}catch(err){
  res.status(400).json({
    status: 'fail',
    message: err
  });
}
*/