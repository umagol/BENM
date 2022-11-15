# <center> BENM | Boilerplate for REST API </center>

![](https://visitor-badge.glitch.me/badge?page_id=umagol.BENM)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/b3eb80984adc4671988ffb22d6ad83df)](https://www.codacy.com/manual/maitraysuthar/rest-api-nodejs-mongodb?utm_source=github.com&utm_medium=referral&utm_content=maitraysuthar/rest-api-nodejs-mongodb&utm_campaign=Badge_Coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b3eb80984adc4671988ffb22d6ad83df)](https://www.codacy.com/manual/maitraysuthar/rest-api-nodejs-mongodb?utm_source=github.com&utm_medium=referral&utm_content=maitraysuthar/rest-api-nodejs-mongodb&utm_campaign=Badge_Grade) ![Travis (.com)](https://img.shields.io/travis/com/maitraysuthar/rest-api-nodejs-mongodb)

A ready-to-use boilerplate for REST API Development with Node.js, Express, and MongoDB

## Getting started

 This is a basic API skeleton written in JavaScript ES2015. Very useful for building RESTful web APIs for your front-end platforms like Android, iOS or JavaScript frameworks (Angular, ReactJS, etc.).

This project will run on **NodeJs** using **MongoDB** as database. I had tried to maintain the code structure easy as any beginner can also adopt the flow and start building an API. Project is open for suggestions, Bug reports and pull requests.

## Features

- Basic Authentication (Register/Login with hashed password)
- Account confirmation with 4 (Changeable) digit OTP.
- Email helper ready just import and use.
- JWT Tokens, make requests with a token after login with `Authorization` header with value `Bearer yourToken` where `yourToken` will be returned in Login response.
- Pre-defined response structures with proper status codes.
- Included CORS.
- **Product** && **User** example with **CRUD** operations.
- Validations added.
- Included API collection for Postman.
- Light-weight project.
- Postman Collection [Link](https://www.postman.com/collections/30604a06ff890ea0180c)
- Test cases with [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/).
- Code coverage with [Istanbuljs (nyc)](https://istanbul.js.org/).
- Included CI (Continuous Integration) with [Travis CI](https://travis-ci.org).
- Linting with [Eslint](https://eslint.org/).

## Software Requirements

- Node.js **12+**  (Recommended **16+**)
- npm **6+**  (Recommended **8+**)
- MongoDB **3.6+** (Recommended **4+**)

## How to install

### Using npm or npx (recommended)

1.  create a BENM app with the npm command. Change "myproject" to your project name.

```bash
 npx  create-benm-app myproject
```
or
```bash
 npm init benm-app myproject
```

### Using Git

1.  Clone the project from github. Change "myproject" to your project name.

```bash
git clone https://github.com/umagol/NodeJs-ExpressJS-MongoDB-Boilerplate.git ./myproject
```

### Using manual download ZIP

1.  Download the repository
2.  Uncompress to your desired directory

**Note**: Remove all unwanted files and folders.

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
```

### Setting up environments  (Git or manual download)

1.  You will find a file named `.env.example` on the project's root directory.
2.  Create a new file by copying and pasting the file and then renaming it to just `.env`
    ```bash
    cp .env.example .env
    ```
3.  The file `.env` is already ignored, so you never commit your credentials.
4.  Change the values of the file to your environment. Helpful comments were added to the `.env.example` file to understand the constants.


## Project structure

```sh
.
├── src
│    ├── bin
│    │   └── www
│    ├── controllers
│    │   ├── AuthController.js
│    │   └── ProductController.js
│    ├── constants
│    │   ├── mailTemplate.js
│    ├── models
│    │   ├── ProductModel.js
│    │   └── UserModel.js
│    ├── routes
│    │   ├── api.js
│    │   ├── auth.js
│    │   ├── privateRouter.js
│    │   ├── publicRouter.js
│    │   └── index.js
│    ├── middlewares
│    │   ├── jwt.js
│    ├── helpers
│    │   ├── apiResponse.js
│    │   └── mailer.js
│    ├── service
│    │   ├── auth.service.js
│    └── utility
│    │   └── utility.js
│    └── app.js
│── public
│    └── index.html
│── test
│    ├── auth.js
│    └── testConfig.js
└── package.json
```

## How to run  🤔

### Running API server locally

```bash
npm run dev
```

You will know the server is running by checking the output of the command `npm run dev`

```bash
DataBase connected successfully...
🚀App is running ... 

Press CTRL + C to stop the process.
```

**Note:** Update your MongoDB connection string in `.env` file.


## Run application using docker 
### Run docker using compose file (recommended)

```bash
npm run start:docker
```
### Build docker image
```bash
npm run build:docker
```
### Run docker image container
```bash
npm run start:docker-image
```

<small>**Note:** into the docker-compose.yml file update your local configuration. and install docker in your system.</small>

### **Creating new controllers**

If you need to add more controllers to the project just create a new file in `/src/controllers/` and use them in the routes.


### **Creating new models**

If you need to add more models to the project just create a new file in `/src/models/` and use them in the controllers.


### **Creating new routes**

If you need to add more routes to the project there are three types of routes:
1. private route
    - The route that requires authentication

    **Note:** we have created auth middleware for checking the user token `Bearer token` require.

2. public route
    - the route that accesses publicly


3. auth route
    - route related to authentication ( for example login, register, forgot password, etc )

**Notes**: If you need to add more routes to the project just create a new file in `src/routes/` and add it in `/routes/api.js` it will be loaded dynamically.

## Tests

### Running Test Cases

```bash
npm test
```

You can set a custom command for a test at the `package.json` file inside the `scripts` property. You can also change timeout for each assertion with `--timeout` parameter of mocha command.

### Creating new tests

If you need to add more test cases to the project just create a new file in `/test/` and run the command.

## ESLint

### Running Eslint

```bash
npm run lint
```

You can set custom rules for eslint in the `.eslintrc.json` file, Added at the project root.

## Bugs or improvements

Every project needs improvements, Feel free to report any bugs or improvements. Pull requests are always welcome.

## License

This project is open-sourced software licensed under the MIT License. See the LICENSE file for more information.
