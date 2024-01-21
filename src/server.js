import * as path from "path";
import * as http from "http";
import { fileURLToPath } from "url";
import socketio from "socket.io";
import express from "express";
import Filter from "bad-words";
import { generateMessage, generateURL } from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsersInTopic } from "./utils/users.js";

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// create web socket connection
io.on('connection', (socket) => {
    console.log('New client connected...');

    socket.on("start", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if ( error ) {
            return callback(error)
        }

        socket.join(user.topic)
        
        socket.emit('message', generateMessage("Admin", "Welcome!"));        
        socket.broadcast.to(user.topic).emit('message', generateMessage(user.username, `${user.username} has joined!`));

        io.to(user.topic).emit("topicData", {
            topic: user.topic,
            users: getUsersInTopic(user.topic)
        })

        callback()
    })

    // event handler for chat messages
    socket.on('sendMessage', (message, callback1) => {
        const user = getUser(socket.id)

        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback1("Profanity is not allowed...")
        }

        io.to(user.topic).emit('message', generateMessage( user.username, message ))
        callback1();
    });

    // event handler to send user's location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.topic).emit(
            'locationMessage', 
            generateURL(user.username, 
                        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`) 
        )
        
        callback();
    })

    // send broadcast to tell that a user left
    socket.on('disconnect', () => {
        const user = removeUser( socket.id )

        if (user) {
            io.to(user.topic).emit('message', generateMessage( user.username, 
                                                            `${user.username} has left...`))
            io.to(user.topic).emit("topicData", {
                topic: user.topic,
                users: getUsersInTopic(user.topic)
            })
        }

        
    });
});

server.listen(port, () => {
    console.log(`Server is up and ruuning on port ${port}!`);
});
