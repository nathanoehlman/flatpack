var flatpack = require('flatpack'),
    customerdb, customer;

// include our module definitions
require('./define-customer');

// get a reference to the customer "db"
customerdb = flatpack.use('customer');

// initialise the customer as a simple JS object
customer = {
    firstName: 'Donald',
    lastName: 'Duck',
    company: 'Walt Disney'
};

// now create a new customer
customerdb.save(customer, function(err, id) {
    console.log('saved customer, id is: ' + id);
});