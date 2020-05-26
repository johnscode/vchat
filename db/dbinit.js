const User = require('../models/user');
const Room = require('../models/room');
const logger = require('../logger');
const request = require('supertest');

var userDict = {};
var roomDict = {};

const initialUsers = () => {
    return [
      new User({
        first_name: 'admin',
        last_name: 'god',
        username: 'god',
        email: 'admin@johnscode.com',
        apikey: 'babacaca4242',
        encryptedPass: 'j'   // see  preSave method in ../models/user.js, it encrypts pass before db insert
      }),
      new User( {
        encryptedPass : "j",
        lastLogin : new Date("2015-09-29T02:04:55.622Z"),
        email : "code@johnscode.com",
        first_name : "John's",
        last_name : "Code",
        username : "johnscode",
        apikey: 'code',
      }),
      new User( {
        encryptedPass : "j",
        lastLogin : new Date("2015-09-29T02:04:55.622Z"),
        email : "dev@johnscode.com",
        first_name : "dev",
        last_name : "Code",
        username : "j",
        apikey: 'j',
      }),
    ];}

const initUsersFunc = async function() {

  return await initialUsers().map(async function (u) {
    logger.info(`user ${JSON.stringify(u)}`);
    userDict[u.username]=u;
    return await u.save();
  });
};

module.exports.setupTestUsers = initUsersFunc;

const deleteUsersFunc = async function() {
  userDict={}
  return await User.deleteMany({});
}
module.exports.clearTestUsers = deleteUsersFunc;

// initUsersFunc().then(function(users) {
//   logger.info('users: '+JSON.stringify(users));
//   process.exit();
// }).catch(function(e) {
//   logger.info('err: '+JSON.stringify(e));
//   process.exit();
// });

const initialRooms = () => {
  gu = userDict['god'];
  jcu = userDict['johnscode'];
  ju = userDict['j'];
  return [
    new Room({
      roomName: 'this room',
      creatorId: gu.userId,
      invitees: [{userId:jcu.userId,name:jcu.username},{userId:ju.userId,name:ju.username}]
    }),
  ];
}
const initialRoomsFunc = async () => {
  return await initialRooms().map(async (r) => {
    logger.info(`room ${JSON.stringify(r)}`);
    roomDict[r.roomName]=r;
    return await r.save();
  });
}
module.exports.setupInitialRooms = initialRoomsFunc;

const clearRoomsFunc = async () => {
  roomDict = {}
  return await Room.deleteMany({});
}
module.exports.clearRooms = clearRoomsFunc

module.exports.clearDb = async () => {
  await clearRoomsFunc();
  await deleteUsersFunc();
}
module.exports.setupDb = async () => {
  const uu = await initUsersFunc();
  return await initialRoomsFunc();
}