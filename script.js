const File = require('./models/fileModel');
const fs = require('fs');

// const connectDB = require('./config/db');
// connectDB();

// Get all records older than 24 hours
exports.DeleteData = async () => {
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const files = await File.find({ createdAt: { $lt: pastDate } });

  if (files.length) {
    for (const each_file of files) {
      try {
        fs.unlinkSync(each_file.path);
        await each_file.remove();
        console.log(`successfully deleted ${each_file.filename}`);
      } catch (err) {
        console.log(`Error while deleting file: ${err}`);
      }
    }
  }
  // console.log('Removed Successfully!');
};

// https://trusting-haibt-6edb30.netlify.app/
