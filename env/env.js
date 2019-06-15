var path = require('path'),
rootPath = path.normalize(__dirname + '/..'),
env = process.env.NODE_ENV || 'development';


var config = {

development: {
root: rootPath,
envir: 'development',
app: {
  name: 'nodeapp'
},
port: process.env.PORT || 4804,
},

test: {
root: rootPath,
envir: 'test',
app: {
  name: 'nodeapp'
},
port: process.env.PORT || 4802,
},

production: {
root: rootPath,
envir: 'production',
app: {
  name: 'nodeapp'
},
port: process.env.port,
}
};

module.exports = config[env];
