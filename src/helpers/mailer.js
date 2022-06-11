const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	secure: process.env.EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
	port: process.env.EMAIL_SMTP_PORT,
	auth: {
		user: process.env.EMAIL_SMTP_USERNAME,
		pass: process.env.EMAIL_SMTP_PASSWORD,
	}
});

exports.send = async function (to, subject, html)
{
	try {
		// send mail with defined transport object
		const mailResult = await transporter.sendMail({
			from: process.env.EMAIL_SMTP_USERNAME, // sender address e.g. no-reply@xyz.com or "Fred Foo 👻" <foo@example.com>
			to: to, // list of receivers e.g. bar@example.com, baz@example.com
			subject: subject, // Subject line e.g. 'Hello ✔'
			html: html // html body e.g. '<b>Hello world?</b>'
		});
		return mailResult;	
	} catch (error) {
		return error;
	}
};