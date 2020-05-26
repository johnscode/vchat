
const path = require('path');
const winston = require('winston');
const config = require('./config/config');

console.log(`${config.logLocation+'/vchat.log'}`)
const logger = winston.createLogger({
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.splat(),
      winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(config.logLocation, 'vchat.log') })
  ]
})

module.exports = logger;