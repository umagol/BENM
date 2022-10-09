exports.otpMailTemplate  = function (otp){
	return`<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="utf-8"> <!-- utf-8 works for most cases -->
	<meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
	<meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
	<meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12" style="padding: 0 2.5em; text-align: center;">
                <h1>Register successfully completed </h1>
				<h2>Please verify your email</h2>
							<h1>OTP: ${otp}</h1>
            				<h3> Don't share your OTP with anyone</h3>
                <p>Thanks,</p>
                <p>Team...</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

exports.accountIsConfirmedTemplate = (email, firstName, lastName) => {
	return `
	<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>
<body>
    <body>
        <div class="container">
            <div class="row">
            <div class="text" style="padding: 0 2.5em; text-align: center;">
            <div class="col-md-12">
                <h1>Your Account is Verified</h1>
            </div>
                    <h1>
                        <br>
                        <span>
                            Let's build something great together.
                        </span>
                    </h1>
                    <h3 style="fond-width:bold;">
                        Email : ${email}

                        <br>

                        Name : ${firstName } ${ lastName}
                    </h3>
                </div>
            </div>
        </div>
        </div>
    </body>
</body>
</html>`;
};

exports.forgotPasswordMailTemplate = (link, name) => {
	return `
	<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
	<head>
		<meta charset="utf-8"> <!-- utf-8 works for most cases -->
		<meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
		<meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
		<meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>Forgot Password</h1>
                <p>Hi ${name},</p>
                <p>Someone requested a password reset for your account. If it was you, click the button below to reset your password. If it wasn't you, you can safely ignore this email.</p>
                <a href="${link}" class="btn btn-primary">Reset Password</a>

				<span> if link is not working use 
				this link : ${link} </span>
				<br/>
                <p>Thanks,</p>
                <p>Team...</p>
            </div>
        </div>
    </div>
</body>
</html>`;	
};

