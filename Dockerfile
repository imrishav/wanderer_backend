#Specify a base Image

FROM node:alpine

#Install Depenendecies
COPY ./ ./
RUN npm install

# Default Command

CMD [ "npm", "start" ]

