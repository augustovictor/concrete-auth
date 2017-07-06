const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }, () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`Connected to database ${ env }`);
});

module.exports = { mongoose };