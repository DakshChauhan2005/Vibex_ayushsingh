import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN
//     }
// });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});
transporter.verify()
    .then(() => {        
        console.log('Email transporter is ready to send emails');
    }).catch((err) => {
        console.error("Email Transporter verification failed", err)
    })


export async function sendMail({ to, subject, html, text }) {
    try {
        const mailOption = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            text
        }

        const details = await transporter.sendMail(mailOption);
        console.log("Email sent", details);
    } catch (error) {
        console.error("Error sending email", error);
    }
}