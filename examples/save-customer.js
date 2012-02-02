var flatpack = require('flatpack');

// include our module definitions
require('./define-customer');

// get a reference to the customer "db"
flatpack.use('customer', function(err, customerdb) {
    var customer = {
            firstName: 'Donald',
            lastName: 'Duck',
            company: 'Walt Disney'
        };

    // now create a new customer
    customerdb.save(customer, function(err, id) {
        console.log('saved customer, id is: ' + id);
    });    
});