var handler = function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;

    if(action == "/814zkcBpsKL.jpg") {
        fs.readFile('./814zkcBpsKL.jpg', function (err, data) {
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'image/jpg' });
            res.end(data);
        });
    }else if(action == "/sprite.jpg") {
        fs.readFile('./sprite.jpg', function (err, data) {
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'image/jpg' });
            res.end(data);
        });
    }else{
        fs.readFile('./page.html', function (err, data) {
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html' });
            res.end(data);
        });
    }
}
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var url = require('url');
var Moniker = require('moniker');
var port = 3250;

console.log("Starting server on port:",port);
app.listen(port);

// socket.io
io.sockets.on('connection', function (socket) {
    var user = addUser();
    socket.emit("welcome", user);
    updateUsers();

    socket.on('disconnect', function () {
        removeUser(user);
    });
    socket.on("position", function(data) {
        var found = false;
        for(var i=0; i<spentx.length; i++) {
            if(spentx[i] == user.x && spenty[i] == user.y) {
                found = true;
            }
        }

        if(!found) {
            spentx.push(user.x);
            spenty.push(user.y);
        }
        user.x = data.x;
        user.y = data.y;
        updateUsers();
    });
});

// game logic
var x = 250;
var y = 250;
var spentx = [];
var spenty = [];
var tilesize = 20;
var users = [];

var addUser = function() {
    var user = {
        name: Moniker.choose(),
        x: 250,
        y: 250,
        tile: tilesize
    }
    users.push(user);
    updateUsers();
    return user;
}
var removeUser = function(user) {
    for(var i=0; i<users.length; i++) {
        if(user.name === users[i].name) {
            users.splice(i, 1);
            updateUsers();
            return;
        }
    }
}
var updateUsers = function() {
    var userlist = users;
    console.log(userlist);
    io.sockets.emit("users", { users: userlist, spent: {x: spentx, y: spenty} });
}
var updateWidth = function() {
    io.sockets.emit("update", { currentWidth: currentWidth });
}