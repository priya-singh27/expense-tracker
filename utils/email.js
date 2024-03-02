const nodemailer = require('nodemailer');

function generateOtp() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++){
        OTP = OTP + digits[Math.floor(Math.random() * 10)] ;
    }

    return OTP;
}
const OTP=generateOtp()


async function sendEmail(email) {
    try {
        // const otp = OTP;
        const transporter = nodemailer.createTransport({
            name:"nodemailer",
            service: 'gmail',
            auth: {
                user:"priyasingh86906@gmail.com",
                pass:'hhry tmbk tknz nnfr'
            },
            port: 3000,
            host:'smtp.gmail.com'
        });

        const mailOptions = {
            from: "priyasingh86906@gmail.com",
            to: email,
            subject: 'Your One-Time Passsword (OTP)',
            text:`Your OTP id: ${OTP}`
        };

        await transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error occurred while sendeing email:',err);
            } else {
                console.log('Email sent successfully!', info.response);
            }
        });
        return OTP;
        
    }
    catch (err) {
        console.log('Error sending email', err);
        throw err;
    }
    
};

const verifyOTP = async (email,enteredOtp) => {
    try {
         
        // Check if the email and OTP are provided
        if (!email || !enteredOtp) {
            return false;
        }

        // Check if the OTP matches
        // const generatedOTP = await sendEmail(email,enteredOtp);
        console.log(enteredOtp);
        console.log(OTP);
        if (enteredOtp === OTP) {
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
    sendEmail,
    verifyOTP
}
