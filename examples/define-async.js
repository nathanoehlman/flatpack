var flatpack = require('flatpack'),
    // create a define alias for creating our models without 
    // having to specify couchurl and testdb repeatedly
    defineModel = flatpack.define.bind(flatpack, 'http://localhost:5984', 'test');
    
async.parallel([
    defineModel('customer'),
    defineModel('order'),
    defineModel('shipment')
], function(err) {
    console.log('models defined');
});