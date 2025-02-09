import { io } from "socket.io-client";

const socket = io("https://event-management-mern.onrender.com/", {
    transports: ["websocket"],
});

export default socket;
