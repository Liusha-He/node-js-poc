FROM node:12

WORKDIR app/chat-ui
COPY . .

RUN npm install

EXPOSE 3000
