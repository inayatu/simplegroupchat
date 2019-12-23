const WebSocketServer = require("ws");

module.exports = server => {
  const wss = new WebSocketServer.Server({ server: server });

  let users = [];
  let messages = [];

  wss.on("connection", ws => {
    ws.on("message", data => {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return;
      }

      if (data.type == "conn") {
        ws.name = data.name;
        users.push(ws);
        console.log(`${data.name} connected`);

        // send back all the messages in chatroom to the connected user
        ws.send(JSON.stringify({ type: "allmsgs", messages, users }));

        // notifiy all the other connected users about new user
        wss.clients.forEach(client => {
          if (client.name != ws.name) client.send(JSON.stringify(data));
        });
      } else if (data.type == "msg") {
        data.name = ws.name;
        messages.push(data);
        // broadcast the msg to all connected messages
        wss.clients.forEach(client => {
          if (client.name != ws.name) {
            client.send(JSON.stringify(data));
          }
        });
      }
    });

    ws.on("close", () => {
      console.log(`${ws.name} disconnected`);
      // remove the user from users array when disconnected
      let index = users.map(item => item.name).indexOf(ws.name);
      if (index > -1) {
        users.splice(index, 1);
      }

      wss.clients.forEach(client => {
        if (client.name != ws.name) {
          client.send(JSON.stringify({ type: "disconn", name: ws.name }));
        }
      });
    });
  });
};
