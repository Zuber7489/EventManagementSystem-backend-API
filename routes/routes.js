const express = require('express');
const router = express.Router();

const ObjectId = require('mongoose').Types.ObjectId;

const Employee = require('../models/employee.js');
const SignUp = require('../models/signUp.js')
const userAddress = require('../models/userAdress');
const Event = require('../models/event');

const userImage = require('../models/image.js');
const { fileUpload } = require('../common');
const { Mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAuthenticate } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { findOne, mapReduce } = require('../models/employee.js');
const generateUniqueId = require('generate-unique-id');
const otpGenerator = require('otp-generator')
const { sendOtp } = require('../middleware/auth')





///////////////
/*------------------------------------------

--------------------------------------------
image upload code using multer
--------------------------------------------
--------------------------------------------*/
// Get , Post, Put, Delete
// Base path: http://localhost:3000/employeesF


// Get Api
router.get('/', async (req, res) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search;
        }
        let userDetails = await Employee.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: '.*' + search + '.*', } },
                        { position: { $regex: '.*' + search + '.*', } },
                        { dept: { $regex: '.*' + search + '.*', } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'userimages', localField: '_id', foreignField: 'userId', as: 'users'
                },

            },


        ]
        )

        res.send(userDetails)
    } catch (error) {
        console.log(error)
        res.status(500)
    }
    // Employee.find((err, doc) => {
    //     if (err) {
    //         console.log('Error in Get Data' + err)
    //     } else {
    //         res.send(doc);
    //     }
    // })




});

// Get Single Employee Api
router.get('/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        Employee.findById(req.params.id, (err, doc) => {
            if (err) {
                console.log('Error in Get Employee by id ' + err)
            } else {
                res.send(doc);
            }
        });
    } else {
        return res.status(400).send('No record found with id' + req.params.id)
    }
});

// Post Api
router.post('/', async (req, res) => {
    try {
        let imageFile = req.files.image;
        let imageName = new Date().getTime() / 1000;
        await fileUpload(imageFile, imageName);
        let body = req.body;
        body.imageName = `./public/${imageName}.jpg`;
        body.password = bcrypt.hashSync(body?.password, 10);
        let emp = new Employee(body);

        let empData = await emp.save()
        let img = new userImage({
            image: body.imageName,
            userId: empData._id
        })
        let returnData = await img.save()
        let userDetails = await userImage.findOne({ userId: emp._id }).populate("userId").exec()
        res.send(userDetails)

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message })
    }

});


// Put Api
router.put('/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {

        let emp = {
            name: req.body.name,
            position: req.body.position,
            dept: req.body.dept,
            office: req.body.office,
            salary: req.body.salary
        };

        Employee.findByIdAndUpdate(req.params.id, { $set: emp }, { new: true }, (err, doc) => {
            if (err) {
                console.log('Error in Update Employee by id ' + err)
            } else {
                res.send(doc);
            }
        });
    } else {
        return res.status(400).send('No record found with id' + req.params.id)
    }
});


// Delete Api
router.delete('/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        Employee.findByIdAndRemove(req.params.id, (err, doc) => {
            if (err) {
                console.log('Error in Delete Employee by id ' + err)
            } else {
                res.send(doc);
            }
        });
    } else {
        return res.status(400).send('No record found with id' + req.params.id)
    }
});



/**
 * API Response
 *
 * @return response()
 */
function apiResponse(results) {
    return JSON.stringify({ "status": 200, "error": null, "response": results });
}


// Main Code Here  //
// Generating JWT
router.post("/user/generateToken", (req, res) => {
    // Validate User Here
    // Then generate JWT Token

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        userId: 12,
    }

    const token = jwt.sign(data, jwtSecretKey);

    res.send(token);
});

// Verification of JWT
router.get("/user/validateToken", (req, res) => {
    // Tokens are generally passed in header of request
    // Due to security reasons.

    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("Successfully Verified");
        } else {
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        let body = req.body
        if (!body.email || !body.password) {
            res.status(400).json({
                message: "email and password required"
            })
            return
        }
        let userDetails = await Employee.findOne({
            email: body.email
        })
        if (!userDetails) {
            res.status(400).json({
                message: "email not register"
            })
            return
        }
        //check password
        let verifyPassword = bcrypt.compareSync(body.password, userDetails?.password)
        if (!verifyPassword) {
            res.status(400).json({
                message: "Password does not match"
            })
            return
        }
        userDetails = userDetails.toJSON()
        let tokenCreated = jwt.sign({
            userId: userDetails._id
        }, '09f26e402586e2faa8da4c98a35f1b20d6b033c60', { expiresIn: '1d' });
        res.setHeader("token", `Bearer ${tokenCreated}`);

        delete userDetails.password
        res.send(userDetails)
    } catch (e) {
        res.status(500).json({
            message: "server side error",
            e: e.message
        })
    }

});


router.get("/check/data", isAuthenticate, async (req, res) => {
    try {
        req.body
        res.send({
            message: "yes"
        })
    } catch (e) {
        res.status(500).json({
            message: "server side error",
            e: e.message
        })
    }

});



// Text mail
router.post("/forget", async (req, res) => {
    try {
        const { email } = req.body;


        // ge user details 
        let userData = await Employee.findOne({
            email: email
        })
        if (!userData) {
            res.status(400).json({
                message: "User not exists"
            })
            return
        }

        let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

        const mailData = {
            from: 'junednss@gmail.com',
            to: `${email}`,
            subject: 'Forget password',
            text: `Hi ${userData.name} your one time password is ${otp}`
        };
        let isMail = await sendOtp(mailData)

        //  = await transporter.sendMail(mailData);
        if (isMail) {
            await Employee.updateOne({
                email: email
            }, {

                otp: otp
            })
            res.send({ message: "success" })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }

});

//Reset-password
router.post("/change-password", async (req, res) => {
    try {
        const { otp, password } = req.body;
        let userOtp = await Employee.findOne({
            otp: otp
        })
        if (!userOtp) {
            res.status(400).json({
                message: "wrong otp"
            })
            return
        }
        const verifyPassword = bcrypt.hashSync(req.body?.password, 10)

        if (userOtp) {
            let checkUpdate = await Employee.updateOne({
                otp: otp
            }, {

                password: verifyPassword,
                otp: ''
            })

            res.send({ message: "password update", verifyPassword })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }


});


router.post("/address", isAuthenticate, async (req, res) => {
    try {
        let body = req.body

        // for (let i = 0; i < body.address.length; i++) {
        //     body.address[i].userId = body.userId
        // }
        // console.log(body)
        // await userAddress.insertMany(body.address)
        let dataSave = new userAddress(body)

        await dataSave.save()
        res.send("successF")


    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }


});





// Post Api
router.post('/signup', async (req, res) => {
    try {

        let body = req.body;
        body.password = bcrypt.hashSync(body?.password, 10);
        let signUp = new SignUp(body);
        let empData = await signUp.save()
        res.send(empData)

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message })
    }

});


// login event
router.post("/loginEvent", async (req, res) => {
    try {
        let body = req.body
        if (!body.email || !body.password) {
            res.status(400).json({
                message: "email and password required"
            })
            return
        }
        let userDetails = await SignUp.findOne({
            email: body.email
        })
        if (!userDetails) {
            res.status(400).json({
                message: "email not register"
            })
            return
        }
        //check password
        let verifyPassword = bcrypt.compareSync(body.password, userDetails?.password)
        if (!verifyPassword) {
            res.status(400).json({
                message: "Password does not match"
            })
            return
        }
        userDetails = userDetails.toJSON()
        let tokenCreated = jwt.sign({
            userId: userDetails._id
        }, '09f26e402586e2faa8da4c98a35f1b20d6b033c60', { expiresIn: '1d' });
        res.setHeader("token", `Bearer ${tokenCreated}`);

        delete userDetails.password
        res.send(userDetails)
    } catch (e) {
        res.status(500).json({
            message: "server side error",
            e: e.message
        })
    }

});


// Post User Event Api
router.post('/addevent',isAuthenticate,  async (req, res) => {
    try {
        let emp = new Event(req.body);
        console.log(emp,'check');
        let empData = await emp.save()
        res.send(empData);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message })
    }

});



//Get Event Api
router.get('/eventlist/data', (req,res)=>{
   
    Event.find((err,doc) =>{
        if(err){
            console.log('error in get data',+err);
        }else{
            res.send(doc);
        } 
    })
});


//Get User Event Api
router.get('/eventlist/userdata',isAuthenticate,async (req,res)=>{
   try {
   let data = await Event.findOne({userId: req.body.userId})
   res.send(data)
   } catch (error) {
    res.status(500).json({ error: error.message })
   }
});


//Get SignUp User Admin
router.get('/signup/alldata',async (req,res)=>{
    try {
    let data = await SignUp.find()
    res.send(data)
    } catch (error) {
     res.status(500).json({ error: error.message })
    }
 });

//Update Pay
// Put Api
router.put('/eventlist/data/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {

        let emp = {
            Status: true,
        }; 
console.log(emp,'data');
        Event.findByIdAndUpdate(req.params.id, { $set: emp }, { new: true }, (err, doc) => {
            if (err) {
                console.log('Error in Update Employee by id ' + err)
            } else {
                res.send(doc);
            }
        });
    } else {
        return res.status(400).send('No record found with id' + req.params.id)
    }
});

module.exports = router;
