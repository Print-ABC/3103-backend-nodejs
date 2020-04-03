const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config');

// Init App
const app = express();

// Append headers to response
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
});


const usersRoutes = require('./api/routes/users');
const organizationsRoutes = require('./api/routes/organizations');
const studentsRoutes = require('./api/routes/students');
const friendsRoutes = require('./api/routes/friends');
const activeUsersRoutes = require('./api/routes/activeusers');

// DB connection
//mongoose.connect('mongodb://127.0.0.1:27017',
 //   {
 //       useNewUrlParser: true
 //   });

// Atlas Connection
mongoose.connect('mongodb://xjustus:' + process.env.MONGO_ATLAS_PW +
   '@ncshare-shard-00-00-ng4qy.mongodb.net:27017,ncshare-shard-00-01-ng4qy.mongodb.net:27017,ncshare-shard-00-02-ng4qy.mongodb.net:27017/test?ssl=true&replicaSet=ncshare-shard-0&authSource=admin&retryWrites=true',
   {
       useNewUrlParser: true
   });

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Forwards requests with different endpoints to different files
app.use('/users', usersRoutes);
app.use('/organizations', organizationsRoutes);
app.use('/students', studentsRoutes);
app.use('/friends', friendsRoutes);
app.use('/activeusers', activeUsersRoutes);

// Requests error handling
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(500 || error.status);
    //TODO: remove before production
    console.log(error.message);
    res.json({
        error: {
            welcome: 'to',
            team : 31,
            success: false
        }
    });
});

module.exports = app;
