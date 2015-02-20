
var net = require('net'), 
	http = require('http'),
	socketio = require('socket.io');

//declare HTTP Server
var httpServer = http.createServer(function(request, response){
        console.log('Connection');
        //response.writeHead(200, {'Content-Type': 'text/html'});
        //response.write('hello world');
        response.end();
    });

// Socket.io server listens to our app
var io = socketio.listen(httpServer);

//create a TCP Server that will accept data from Mirth Connect. 
//Cut out all the HTTP header nonsense!!
var tcpServer = net.createServer(function(socket){
	console.log("Connection from " + socket.remoteAddress);

	tcpServer.getConnections(function(error, count){
		console.log("Number of concurrent tcp connections= " + count);
	});

	socket.on('end', function(){
		console.log("tcpServer disconnected...");
	});

	socket.on('data', function(data){

		var parsedJson = JSON.parse(data);
		io.sockets.emit('cpu', {x: parsedJson.time, y: parsedJson.cpu});
		io.sockets.emit('channelSentCPU', {x: parsedJson.time, y: parsedJson.channels[0].source.received, y2: parsedJson.cpu});
	});

	socket.on('error', function(error){
		console.log("Something wrong happened here");
		socket.destroy();
	});
  	socket.on('close', function() {
    	console.log('TCP connection closed');
	});
});
tcpServer.maxConnections = 10;

tcpServer.listen(3000, "localhost");
console.log("TCP Server listening on port 3000 at localhost");

httpServer.listen(8001);
console.log("HTTP Server listening on port 8001 at localhost");