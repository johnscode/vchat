
const logger = require('../logger');
var mongoose = require('mongoose');
var config = require('../config/config');
const guid = require('uuid');

const conn = mongoose.connect(config.mongoDbEndpoint, {useNewUrlParser: true,useUnifiedTopology: true});
const db=mongoose.connection;
db.on('error', function () {
  logger.error('sample connection error:')
});
db.once('open', function () {
  logger.info('room successfully connected to Mongo Db');
});


var roomSchema = new mongoose.Schema({
  roomId : {type: String, index: true, unique:true},
  roomName : {type: String, index: true, unique:true},
  creatorId : {type: String, index: true, unique:false},
  // uuid : {type: String, index: true,unique:false},
  // slug : {type: String, index: true,unique:false},
  // data : { type: Object },
  occupants : [{ userId: String, uuid: String, name: String}],
  invitees : [{ userId: String, name: String}],
  createdAt : { type: Date, index: true },
  updatedAt : { type: Date },
});
roomSchema.pre('update', function(next) {
  this.updatedAt=new Date();
  next();
});

roomSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId=guid.v4();
  }
  if (!this.createdAt) {
    this.createdAt=new Date();
    this.updatedAt=new Date();
  }
  next();
});

var roomModel = mongoose.model('room',roomSchema);
module.exports = roomModel;

module.exports.findByRoomName = async (name) => {
  return roomModel.findOne({'roomName':name});
}

