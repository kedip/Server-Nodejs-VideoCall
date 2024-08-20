// const express = require("express")
// const http = require("http")
// const app = express()
// const server = http.createServer(app)
// const io = require("socket.io")(server, {
// 	cors: {
// 		origin: "http://localhost:3000",
// 		methods: [ "GET", "POST" ]
// 	}
// })

// io.on("connection", (socket) => {
// 	socket.emit("me", socket.id)

// 	socket.on("disconnect", () => {
// 		socket.broadcast.emit("callEnded")
// 	})

// 	socket.on("callUser", (data) => {
// 		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
// 	})

// 	socket.on("answerCall", (data) => {
// 		io.to(data.to).emit("callAccepted", data.signal)
// 	})
// })

// server.listen(5000, () => console.log("server is running on port 5000"))

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});
const clients = {};

io.on("connection", (socket) => {
	const clientId = socket.id;
	clients[clientId] = socket;

	socket.on("disconnect", () => {
		delete clients[clientId];
	});

	socket.on("callUser", (data) => {
		const callerId = data.from;
		const calleeId = data.userToCall;

		if (clients[calleeId]) {
			clients[calleeId].emit("callUser", { signal: data.signalData, from: callerId, name: data.name });
		}
	});

	socket.on("hangUp", (data) => {
		const calleeId = data.to;

		if (clients[calleeId]) {
			clients[calleeId].emit("call-ended");
		}
	});


	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});

	socket.on("endCall", () => {
		io.to(data.to).emit('call-ended');
		io.to(data.from).emit('call-ended');
	});
});

server.listen(5000, () => console.log("server is running on port 5000"));
