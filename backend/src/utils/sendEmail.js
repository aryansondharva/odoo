const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const requiredSettings = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD'];
    const missingSettings = requiredSettings.filter((key) => !process.env[key]);
    if (missingSettings.length) {
        throw new Error(`Missing email configuration: ${missingSettings.join(', ')}`);
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'RentFlow'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional HTML body
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
