FROM node:14

# Create app directory
WORKDIR /benm-app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
ADD package*.json ./

RUN npm install; npm cache clean --force

# Bundle app source
COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
