

const logger = require('../logger');
const User = require('../models/user');

const indexController = {};

indexController.index = async (req,resp,next) => {
  logger.info(`index params ${JSON.stringify(req.query)}`);
  logger.info(`index params ${JSON.stringify(req.user)}`);
  logger.info(`index params ${JSON.stringify(req.session.user)}`);
  resp.render('index', { title: "John's Video Chat",name:req.user.username,room:'this room' });
}
module.exports = indexController;

