const express = require("express");
const app = express();
const server = require("http").createServer(app);

const PORT = 3000;

require("./websocket")(server);

app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Chat App running at: ${PORT}`);
});
