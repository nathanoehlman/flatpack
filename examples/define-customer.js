var flatpack = require('flatpack');
    
// define the customer model
flatpack.define(
    'http://localhost:5984', // the couch url
    'test', // the target database
    'customer', // the model name
    function(err) {
        console.log('defined customer model');
    }
);