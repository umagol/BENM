# Getting Started with BENM | Boilerplate for API 

This project was bootstrapped with [create-benm-app](https://github.com/umagol/BENM).


## How to run  🤔

### Running API server locally

```bash
npm run dev
```

You will know server is running by checking the output of the command `npm run dev`

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
    - route that requires authentication

    **Note:** we are created auth middleware for checking user token `Bearer token` require.

2. public route
    - route that access publicly


3. auth route
    - route related to authentication ( for example: login, register, forgot password, etc )

**Notes**: If you need to add more routes to the project just create a new file in `src/routes/` and add it in `/routes/api.js` it will be loaded dynamically.

## Tests

### Running Test Cases

```bash
npm test
```

You can set custom command for test at `package.json` file inside `scripts` property. You can also change timeout for each assertion with `--timeout` parameter of mocha command.

### Creating new tests

If you need to add more test cases to the project just create a new file in `/test/` and run the command.

## ESLint

### Running Eslint

```bash
npm run lint
```

You can set custom rules for eslint in `.eslintrc.json` file, Added at project root.

## Bugs or improvements

Every project needs improvements, Feel free to report any bugs or improvements. Pull requests are always welcome.



## Learn More

You can learn more in the [BENM documentation](https://github.com/umagol/BENM).

To learn React, check out the [BENM Site](https://umagol.github.io/BENM/).
