FROM node:lts-jessie

WORKDIR /usr/app
RUN mkdir /usr/app/uploads && chown node:node /usr/app/uploads
RUN mkdir /usr/app/uploads/tmp && chown node:node /usr/app/uploads/tmp
COPY server/package.json .
RUN npm install bcryptjs
RUN npm install -q

COPY server/ .

RUN apt-get -qq update
RUN apt-get -qq -y install gdal-bin
