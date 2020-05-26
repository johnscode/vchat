/**
 * 
 */
var env = process.env.NODE_ENV || "development";

const logger = require('../logger');
const mongoose = require('mongoose');
const config = require('../config/config');
const uuid = require('uuid');
const _ = require('lodash');

const bcrypt = require('bcrypt');
const saltRounds = 10;

mongoose.connect(config.mongoDbEndpoint, {useNewUrlParser: true,useUnifiedTopology: true});
const db=mongoose.connection;
db.on('error', function(e) {
	logger.error('user connection error:')
});
db.once('open', function () {
	logger.info('user successfully connected to Mongo Db');
});

var userSchema = new mongoose.Schema({
	userId : {type: String, index: true, unique: true},
	first_name : { type: String },
	last_name : { type: String },
	encryptedPass : { type: String },
	passEncrypted : { type: Boolean },
	email : { type: String, index: true, unique: true },
	username : { type: String, index: true, unique: true },
	phone : { type: String },
	apikey : { type: String, index: true, unique: true },
	avatar_url : { type: String },
	device_token : { type: String },
	authToken: {type: String, index: true, required: false},
	authTokenDate: {type: Date},
	createdAt : { type: Date },
	updatedAt : { type: Date },
	lastLogin : { type: Date },
});

userSchema.pre('update', function(next) {
//	this.update({},{ $set: { updatedAt: new Date() } });
//	console.log('user will update: ');
	this.updatedAt=new Date();
//	console.log('user before update: ');
	next();
});
userSchema.pre('save', function(next) {
	if (!this.passEncrypted && this.encryptedPass) {
		logger.debug("encrypting '"+this.encryptedPass+"' for "+this.email);
		this.encryptedPass = bcrypt.hashSync(this.encryptedPass,saltRounds);
		this.passEncrypted=true;
	}
	if (!this.userId) {
		this.userId=uuid.v4();
	}
	if (!this.apikey) {
		this.apikey=uuid.v4();
	}
	if (!this.createdAt) {
		this.createdAt=new Date();
		this.updatedAt=new Date();
	}
	next();
});

userSchema.methods.verifyPassword = function (password) {
	return bcrypt.compareSync(password, this.encryptedPass) ;
};

userSchema.methods.tokenValid = function (cb) {
	if (!_.isNil(this.authToken) && !_.isNil(this.authTokenDate)) {
		return authTokenDate>Date.now()
	}
	return false;
}
userSchema.methods.cookieRef = function () {
	return {
		user_id: this.user_id,
		authToken: this.authToken,
		authTokenDate: this.authTokenDate
	};
}
userSchema.methods.exposedData = function() {
  var exposedUserData = {
		userId: this.userId,
    username: this.username,
    email: this.email,
    first_name: this.first_name,
    last_name: this.last_name,
    avatar_url: this.avatar_url,

		// just for dev
    apikey: this.apikey,
    authToken: this.authToken,
    authTokenDate: this.authTokenDate
  };
  return exposedUserData;
}

var UserModel = mongoose.model('User',userSchema);
module.exports = UserModel;

module.exports.findByUserId = async (id) => {
	return UserModel.findOne({'userId':id})
}

module.exports.findByUsername = async (username) => {
	return UserModel.findOne({'username':username})
}

// module.exports.findByUserId = function(uid) {
//   return UserModel.findOne({'user_id':uid});
// };
//
// module.exports.findByEmailOrUsername = function(emailOrUsername) {
// 	logger.info("find user: "+emailOrUsername);
// 	return UserModel.findOne({$or:[{'email':emailOrUsername},{'username':emailOrUsername}]});
// };
//
// //callback is func(err,adminUser)
// var getAdminUserFunc = function(cb) {
// 	return UserModel.findOne({'email':'admin@johnjfowler.com'});
// };
// module.exports.getAdminUser = getAdminUserFunc;
//
// module.exports.findByAuthToken = function(token,cb) {
// //logger.info("find user by authtoken: "+token);
// 	return UserModel.findOne({'authToken':token});
// };


