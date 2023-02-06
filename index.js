const express = require('express');
const bodyParser = require('body-parser');
const upload = require('express-fileupload');
const cors = require('cors');
const dotenv = require('dotenv');

const mongoose = require('./db.js');
const routes = require('./routes/routes.js');
const authRoutes = require('./middleware/auth');
const app = express();
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 3000;

// Set up Global configuration access
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors());
app.use(upload())
app.use(express.static('public'))


app.use('/employee', routes)
app.use(function(req, res, next) {
    var err = new Error('URL not found');
    err.status = 404;
    next(err);
});






// app.use('/',authRoutes);

app.listen(PORT, () => console.log('Server started at port: 3000'));


