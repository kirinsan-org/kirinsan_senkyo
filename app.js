var connect = require('connect'), fs = require('fs');
var app = connect.createServer(connect.static(__dirname)).listen(4444);
var io = require('socket.io').listen(app);
var data = JSON.parse(fs.readFileSync(__dirname + '/backup.json'))
/*
 * { q1 : { yes : 0, no : 0 }, q2 : { yes : 0, no : 0 } }
 */
, people = 0;

io.sockets.on('connection', function(socket) {
	people++;
	socket.on('vote1', vote1);
	socket.on('vote2', vote2);
	socket.on('get', getAnswers);
	socket.on('people', getPeople);
	socket.on('disconnect', disconnect);

	io.sockets.emit('people', people);

	function vote1(ans) {
		if (ans === 'yes') {
			data.q1.yes++;
		} else if (ans === 'no') {
			data.q1.no++;
		}
		io.sockets.emit('refresh', data);
	}

	function vote2(ans) {
		if (ans === 'yes') {
			data.q2.yes++;
		} else if (ans === 'no') {
			data.q2.no++;
		}
		io.sockets.emit('refresh', data);
	}

	function getAnswers(cb) {
		if (cb) {
			cb(data);
		}
	}

	function getPeople(cb) {
		if (cb) {
			cb(people);
		}
	}

	function disconnect() {
		// people--;
		io.sockets.emit('people', people);
	}
});

setInterval(function() {
	fs.writeFile(__dirname + '/backup.json', JSON.stringify(data));
}, 30000);