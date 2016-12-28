var http = require('http');
var fs = require('fs');
var url = require('url');
var socket = require('socket.io')();

var landingHandler = function(req, res){
/* Landing Handler determines whether the connecting user is
 * a new user, a host of an existing session, or a client of 
 * an existing session. It then routes the page accordingly.
 * */
    var cb = function(err, data){
        //sends data in response after path to right HTML has been determined
        if(err){
            res.writeHead(500);
            console.error(err);
            return res.end("ERROR: Failed to load landing page");
        }else{
            res.writeHead(200);
            res.end(data);
        }
    }

    var newConnection = true;   //if the user is not a host or client of an existing session
    for(var i in global.sessions) {
        //looking for if the connecting user is a host of an existing session
        if(global.sessions[i].host.ip===req.connection.remoteAddress) {
            fs.readFile(__dirname + '/pages/host.html', cb);
            newConnection = false;
            break;
        }
        for(var j in global.sessions[i].clients) {
            //looking for if the connecting user is a client of an existing session
            if(global.sessions[i].clients[j].ip===req.connection.remoteAddress) {
                fs.readFile(__dirname + '/pages/client.html', cb);
                newConnection = false;
                break;
            }
        }
    }
    if(newConnection){
        //The connecting user was not determined to be a host or client of an existing session
        //so bring them to the landing page where they can choose to host or join session
        fs.readFile(__dirname + '/pages/landing.html', cb);
    }
};

var app = http.createServer(landingHandler);
var io = socket.listen(app);

global.sessions = []; //globally accessible session information among all packets
global.sessionDistribution = function(sid, includeHost){
    /* Session Disitribution is a globally accessible function that returns an array
     * of sockets that belong to a specific session.
     * Param 1: Session ID of the specific session
     * Param 2: (optional)
     *          TRUE: Host & Clients included in distribution
     *          FALSE: Only Clients included in distribution
     *          Default: TRUE
     * Usage:   var distro = global.sessionDistribution('abcd', true);
                for(var i in distro){
                    distro[i].emit('broadcast', packet);
                }
     * */
    includeHost=includeHost||true;
    var distribution = [];
    for(var i in global.sessions){
        var sesh = global.sessions[i];
        if(sesh.id===sid){
            if(includeHost){
                var host = sesh.host;
                distribution.push(io.sockets.sockets[host.id]);
            }
            for(var j in sesh.clients){
                var client = sesh.clients[j];
                distribution.push(io.sockets.sockets[client.id]);
            }
            break;
        }
    }
    return distribution;
}
io.sockets.on('connection', require('./packets/packet000')().serve);
io.sockets.on('disconnect', require('./packets/packet999')().serve);

app.listen(1337);
console.log('Server Running');