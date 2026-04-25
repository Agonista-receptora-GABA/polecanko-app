const express = require("express");
const http = require("http");
const WebSocketServer = require("ws").Server;
const WebSocket = require("ws");
const sqlite = require("sqlite3").verbose();

const app = express();
const server = http.createServer();
const httpSockets = new Set();

let isShuttingDown = false;

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);

server.on("connection", (socket) => {
  httpSockets.add(socket);

  socket.on("close", () => {
    httpSockets.delete(socket);
  });
});

server.listen(3000, function () {
  console.log("Server started on port 3000");
});

/** Begin WebSockets */
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
  if (isShuttingDown) {
    ws.close(1001, "Server shutting down");
    return;
  }

  const numClients = wss.clients.size;

  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === WebSocket.OPEN) {
    ws.send("Welcome to my server");
  }

  db.run(
    `INSERT INTO visitors (count, time)
     VALUES (${numClients}, datetime('now'))`,
    (err) => {
      if (err) {
        console.log("Insert SQL err:", err);
      }
    },
  );

  ws.on("close", function close() {
    const currentClients = wss.clients.size;
    wss.broadcast(`Current visitors: ${currentClients}`);
    console.log("A client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
/** End WebSockets */

/** Begin Database */
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts(done) {
  db.each(
    "SELECT * FROM visitors",
    (err, row) => {
      if (err) {
        console.log("Get counts SQL err:", err);
        return;
      }

      console.log(row);
    },
    (err, count) => {
      if (err) {
        console.log("getCounts complete err:", err);
      } else {
        console.log("getCounts query completed, rows:", count);
      }

      done();
    },
  );
}

function shutdownDB(done) {
  console.log("Shutting down db");

  getCounts(() => {
    db.close((err) => {
      if (err) {
        console.log("DB close err:", err);
        done(err);
        return;
      }

      done(null);
    });
  });
}
/** End Database */

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("sigint");

  server.close((err) => {
    if (err) {
      console.log("Error on server closing:", err);
      process.exit(1);
      return;
    }

    shutdownDB((dbErr) => {
      if (dbErr) {
        process.exit(1);
        return;
      }

      process.exit(0);
    });
  });

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, "Server shutting down");

      const timer = setTimeout(() => {
        if (client.readyState !== WebSocket.CLOSED) {
          client.terminate();
        }
      }, 2000);

      timer.unref();

      client.once("close", () => {
        clearTimeout(timer);
      });
    } else {
      client.terminate();
    }
  });

  setTimeout(() => {
    httpSockets.forEach((socket) => {
      socket.destroy();
    });
  }, 2500).unref();

  setTimeout(() => {
    console.log("Force exit after timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
