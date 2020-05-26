

const logger = require('../logger');
const User = require('../models/user');

const roomController = {};

roomController.index = async (req,resp,next) => {
  logger.info(`index params ${JSON.stringify(req.query)}`);
  logger.info(`index params ${JSON.stringify(req.session.user)}`);
  resp.render('room', { title: "John's Video Chat",name:req.session.user.username,room:'this room' });
}
module.exports = roomController;

