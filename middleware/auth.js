const jwt = require("jsonwebtoken");
const express = require('express');
const dotenv = require('dotenv');
const router = express.Router();
let Employee = require('../models/employee');
const nodemailer = require('nodemailer');


// Main Code Here  //
// Generating JWT

const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        req.authToken = req.headers.authorization.split(" ")[1];
    } else {
        req.authToken = null;
    }
    next();
};


exports.isAuthenticate = async (req, res, next) => {
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    getAuthToken(req, res, async () => {
        try {

            let verified = jwt.verify(req.authToken, '09f26e402586e2faa8da4c98a35f1b20d6b033c60');
            if (verified.userId) {
                let checkUser = await Employee.findOne({
                    _id: verified.userId
                })
                if (checkUser) {
                    req.body.userId = verified.userId
                    return next();
                } else {
                    res.status(401).json({
                        message: "user not authrized"
                    })
                    return
                }

            } else {
                // Access Denied
                return res.status(401).send(error);
            }
        } catch (error) {
            // Access Denied
            return res.status(401).send(error);
        }
    })


}

exports.sendOtp = async (dataObject)=>{
    try {
        const transporter = nodemailer.createTransport({
            port: 465,               // true for 465, false for other ports
            host: "smtp.gmail.com",
            auth: {
                user: 'junednss@gmail.com',
                pass: 'oionhzpetavbvudm'
            },
            secure: true,
        })
    
        const mailData = {
            from: 'junednss@gmail.com',
            to: `${dataObject.to}`,
            subject: `${dataObject.subject}`,
            text: `${dataObject.text}`
    //        text: `Hi ${userData.name} your one time password is ${otp}`
        };
    
        return  isMail = await transporter.sendMail(mailData);
        
    } catch (error) {
        throw error
    }
    
}
