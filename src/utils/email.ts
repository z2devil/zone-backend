import config from '../../settings';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: '465',
    secureConnection: true,
    secure: true,
    auth: { user: config.mail.username, pass: config.mail.password },
});

export default {
    send: (to: string, subject: string, content: string) => {
        const data = {
            from: config.mail.username,
            to,
            subject,
            text: content,
            // html: '支持发送html',
        };
        transporter.sendMail(data);
    },
};
