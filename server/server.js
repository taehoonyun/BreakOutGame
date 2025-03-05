const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
const api = require('./routes/api');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all clients to connect
    methods: ["GET", "POST"]
  }
});
app.use(cors());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Build output folder
app.use(express.static(path.join(__dirname, 'build')));

// API location
app.use('/api', api);

// Import Socket.io event handlers (modularized)
require("./module/socket")(io);

// // For any other requests, serve the React app's index.html file.
// app.get("*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "client/build", "index.html"));
  // });

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
