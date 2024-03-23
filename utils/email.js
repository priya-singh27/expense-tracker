require('dotenv').config();
const User = require('../model/user');
const nodemailer = require('nodemailer');
const userEmail = process.env.USER;
const pass = process.env.PASS;


async function generateOtp() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++){
        OTP = OTP + digits[Math.floor(Math.random() * 10)] ;
    }
    const existingUser = await User.findOne({ otp: OTP });
    if (existingUser) {
        return generateOtp();
    }

    return OTP;
}
// const OTP = generateOtp();


async function sendEmail(email,otp) {
    try {
        // const otp = OTP;
        const transporter = nodemailer.createTransport({
            name:"nodemailer",
            service: 'gmail',
            auth: {
                user:userEmail,
                pass:pass
            },
            port: 3000,
            host:'smtp.gmail.com'
        });

        const mailOptions = {
            from: "priyasingh86906@gmail.com",
            to: email,
            subject: 'Your One-Time Passsword (OTP)',
            text:`Your OTP id: ${otp}`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', info.response);

        // await transporter.sendMail(mailOptions, (err, info) => {
        //     if (err) {
        //         console.log('Error occurred while sendeing email:',err);
        //     } else {
        //         console.log('Email sent successfully!', info.response);
        //     }
        // });
        // return otp;
        
    }
    catch (err) {
        console.log('Error sending email', err);
        throw err;
    }
    
};

const verifyOTP = async (generatedOtp,enteredOtp) => {
    try {
         
        // Check if the email and OTP are provided
        if (!generatedOtp || !enteredOtp) {
            return false;
        }

        // Check if the OTP matches
        // const generatedOTP = await sendEmail(email,enteredOtp);
        // console.log(enteredOtp);
        // console.log(OTP);
        if (enteredOtp === generatedOtp) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
};

// const verifyOTP = async (req, res) => {
//     try {
        
//         // Check if the email and OTP are provided
//         if (!req.body.email || !req.body.otp) {
//             return res.status(400).send("Email and OTP are required");
//         }

//         // Check if the OTP matches
//         const generatedOTP = await sendEmail(req.body.email);
//         if (generatedOTP === req.body.otp) {
//             res.status(200).send("OTP is verified successfully");
//         } else {
//             res.status(400).send("Invalid OTP");
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Internal server error");
//     }
// };

module.exports = {
    generateOtp,
    sendEmail,
    verifyOTP
}
