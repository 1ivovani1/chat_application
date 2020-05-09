let io = require('socket.io');
let http = require('http');

let app = http.createServer();
io = io.listen(app);
app.listen(5000);

io.sockets.on('connection', function (socket) {
	socket.on('login_server', function (data) {
		console.log(data);
        
        socket.emit('get_login_response', { data: 'Hello Client from websocket' });
	});
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});