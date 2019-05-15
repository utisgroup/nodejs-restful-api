
const express = require('express');
const app = express(); 

// DB -PassWord - 2zvVr0y6unun4PJj

const morgan = require('morgan');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
// mongodb+srv://node-shop:<password>@cluster0-wdlpm.mongodb.net/test?retryWrites=true

/*
user name - node-shop,
password - u3GOSwi8ToB0j8Fc
*/

mongoose.connect('mongodb+srv://node-shop:' 
+ process.env.MONGO_ATLAS_PW + 
'@cluster0-wdlpm.mongodb.net/test?retryWrites=true', 
{ 
    useNewUrlParser: true
});

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
app.use((req, res, next ) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH");
        return res.status(200).json({});
    }
    next();
});


// Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

app.use((req, res, next ) =>{
    const error = new Error('Not found...');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;