const express = require("express");
const cors = require('cors');
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
const api = require('./routes/api');
app.use(cors());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Build output folder
app.use(express.static(path.join(__dirname, 'build')));

// API location
app.use('/api', api);


// For any other requests, serve the React app's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
