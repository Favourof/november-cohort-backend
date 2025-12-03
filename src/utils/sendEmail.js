const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    transporter.verify((error, success)=>{
        if (success) {
            console.log("noilmailer is active");
            
        }else{
            console.log(error);
            
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,    
        html,
    });

};

module.exports = sendEmail;
