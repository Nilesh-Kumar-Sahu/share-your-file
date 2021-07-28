const express = require('express');

const router = express.Router();

const File = require('../models/fileModel');

router.get('/:uuid', async (req, res) => {
  try {
    // Quering in DATABASE 
    const file = await File.findOne({ uuid: req.params.uuid });

    // If the file is not there or the link has expired then show the below error
    if (!file) {
      return res.render('download', { error: 'Link has been expired.' });
    }

    return res.render('download', {
      uuid: file.uuid,
      fileName: file.filename,
      fileSize: file.size,
      downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
    });

    // http://localhost:3000/files/download/54253gehwgdhsb-gdjcbj
  } catch (err) {
     res.status(400).json({
      status: 'fail',
      message: err
    });
  }

});

module.exports = router;
