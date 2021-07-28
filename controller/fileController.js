const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/fileModel');
const short = require('short-uuid');

// Set Storage Engine
let storageEng = multer.diskStorage({
  // Where we want to upload our file
  destination: (req, file, cb) => cb(null, 'uploads/'),

  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const uniqueName = `user_${short.generate()}-${Math.round(
      Math.random() * 1e9
    )}.${ext}`;
    //uniqueName- user_8ty5xQzehm3s3agePuHYqH-81553491.jpeg

    cb(null, uniqueName);
  },
});

// Init Upload
const upload = multer({
  storage: storageEng,
  limits: { fileSize: 1000000 * 100 },
});

// Uploading only single file
exports.uploadUserFile = upload.single('myfile'); //upload.single( 'field Name or key' )

exports.uploadFile = async (req, res, next) => {
  try {
    // init file
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }

  next();
};

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
