const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(','),
  // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
};

app.use(cors(corsOptions));

// Middleware - if anybody sends JSON data then this below line will
// basically parse the json data
app.use(express.json());

// Setting Template Engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Telling express the path of our static folder
app.use(express.static('public'));

// Creating Our Own Middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

// 2) ROUTER

// Upload file and send mail Rout
app.use('/api/files', require('./routes/files'));

// Show download link Rout
app.use('/files', require('./routes/show'));
// http://localhost:5000/files/e31a5347-20e6-45eb-89b8-a470bbe4bf02

// Download Link Rout
app.use('/files/download', require('./routes/download'));

module.exports = app;
