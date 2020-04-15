#Specify a base Image

FROM node:alpine

#Install Depenendecies

RUN npm install

# Default Command

CMD [ "npm", "start" ]

