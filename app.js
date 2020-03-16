var xss = require("xss");
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = [];

app.use(express.static(__dirname + "/components", {
		index: false, 
		immutable: true, 
		cacheControl: true,
		maxAge: "30d"
}));
app.disable('x-powered-by');

server.listen(5000, function(req, res){
    console.log('listen on port 5000')
})
app.get('/', function(req, res){
	console.log(__dirname)
    res.sendFile(__dirname + '/components/index.html')    
})

io.sockets.on('connection', function(socket){	
	socket.on('new user', function(data, callback){
		if(data in users){
			callback(false);
		}else{
			socket.nickname = data;
			users[socket.nickname] = socket
			io.sockets.emit('usernames', users);
			updateNicknames()
			callback(true)
			
		}
	})

	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users))
	}
    socket.on('send-message', function(data, callback){
		var msg = data.messageBox.trim();
		if(data.user !== ''){
			var name = data.user
			users[name].emit('whisper', {'msg':xss(msg), 'nick':socket.nickname})			
		}else {
			io.sockets.emit('new message', {'msg':xss(msg), 'nick':socket.nickname})
/*			if(msg.substr(0,3) === '/w '){
				msg = msg.substr(3)
				var ind = msg.indexOf(' ')
				if(ind !== -1){
					var name = msg.substr(0, ind)
					var msg = msg.substr(ind + 1)
					if(name in users){
						users[name].emit('whisper', {'msg':msg, 'nick':socket.nickname})
					}else{
						users[socket.nickname].emit('whisper', {'msg':'Erro! Insira um usuário válido!', 'nick':socket.nickname})
					}
				}else{
					console.log('aki 3')
					users[socket.nickname].emit('whisper', {'msg':'Erro! Insira uma mensagem para o usuário!', 'nick':socket.nickname})
	//				callback('Erro! Insira uma mensagem para o usuário.');
				}
			}else{
				console.log('aki 4')
				io.sockets.emit('new message', {'msg':msg, 'nick':socket.nickname})
			}*/
		}
	})
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname]
		updateNicknames();
	})
})