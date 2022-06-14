const nodeMailer = require('nodemailer')

const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        service:process.env.SMTP_SERVICE,
        
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD
        }
    })

    const mailOptions = {
        from:process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    transporter.verify((err, success) => {
        if (err) console.error(err);
        
    });

    let info = await transporter.sendMail(mailOptions)
    console.log(`Message Sent: ${info.messageId}`);
}

module.exports = sendEmail