# Set node js
FROM node:carbon


# Set the working directory to /app
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN \
  apt-get update && \
  apt-get install -y python python-dev python-pip python-virtualenv && \
  rm -rf /var/lib/apt/lists/*


RUN npm install
# If you are building your code for production
# RUN npm install --only=production
COPY . .


EXPOSE 8080

#CMD [ "npm", "run", "server" ]
CMD ["node", "doAllSentiment.js"]