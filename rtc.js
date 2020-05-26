

const WebSocket = require('ws');
const logger = require('./logger');
const roomService = require('./services/roomService');
const userSessionTrack = require('./middleware/userSessionTrack');

const WebSocketServer = WebSocket.Server;

var connectedSockets = [];

//
// server can be either http or https, such as
// returned by http.createServer
//
const configWebRTCServer = function(server) {

  // Create a server for handling websocket calls
  // wss = new WebSocketServer({server: server});
  const wss = new WebSocket.Server({ noServer: true });
  server.on('upgrade', function upgrade(request, socket, head) {
    userSessionTrack.sessionParser(request, {}, () => {
      logger.info(`wss upgrade parsed session: ${JSON.stringify(request.session)}`)
      if (!request.session.user) {
        logger.info("no user in session for wss");
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, function done(ws) {
        connectedSockets.push({username:request.session.user.username,uuid:request.session.user.userId,ws:ws});
        wss.emit('connection', ws, request);
      });
    });
  });

  wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      // Broadcast any received message to all clients
      const msg = JSON.parse(message);
      if (msg.join) {
        logger.info(`join: ${message}`);
      } else if (msg.leave) {
        logger.info(`leave: ${message}`);
      } else if (msg.room) {
        logger.info(`broadcast: ${message}`);
        wss.broadcast(message);
      } else {
        // these need to be forwarded for webrtc to work
        logger.info(`msg: ${message}`);
        wss.broadcast(message);
      }
    });
    ws.on('error', (err) => {
      logger.error(`socket error : ${e}`);
    });
    ws.on('close',(d) =>{
      logger.info(`socket closed for ${JSON.stringify(ws._socket.remoteAddress)} ${ws._socket.remotePort}`);
      connSocket = connectedSockets.find(cs => cs.ws === ws);
      if (connSocket) {
        logger.info(`connected socket removed: ${connSocket.username} ${connSocket.userId}`);
      }
      connectedSockets = connectedSockets.filter( cs => cs.ws !== ws);
    })
  });

  wss.broadcast = function(data) {
    this.clients.forEach(function(client) {
      if(client !== wss && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };


}

module.exports = configWebRTCServer;

const socketForUsername = (username) => {
  connSocket = connectedSockets.find(cs => cs.username === username);
  return connSocket;
}
module.exports.socketForUsername = socketForUsername;

const socketForUserId = (userId) => {
  connSocket = connectedSockets.find(cs => cs.userId === userId);
  return connSocket;
}
module.exports.socketForUserId = socketForUserId;

module.exports.connectedSockets = connectedSockets;
