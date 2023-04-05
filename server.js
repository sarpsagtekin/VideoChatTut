const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

const io = require("socket.io")(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_FRONTEND_URL
        : "https://likom-video.herokuapp.com/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(port, () =>
  console.log("Backend Likom server is running on port " + port)
);
