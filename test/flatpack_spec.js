var expect = require('chai').expect,
    flatpack = require('../flatpack'),
    views = require('../lib/views'),
    config = require('config'),
    async = require('async'),
    supercomfy = require('supercomfy'),
    db = supercomfy(config.admin.couchurl);


/**
  Prepare for some of the larger tests
 **/
function prepare(callback) {
    
    var customers = [{firstName: 'Nathan', lastName: 'Oehlman', company: 'Sidelab'}, {firstName: 'Damon', lastName: 'Oehlman', company: 'Sidelab'}],
        products = [{name: 'Mr Magic Window Clean'}, {name: 'Jelly Beans'}];

    async.parallel([
        function(ready) {
            flatpack.define(config.couchurl, config.db, 'customer', {views: {byName: ['firstName', 'lastName'], byFirstName: ['firstName']}}, function(err) {
                if (err) return ready(err);
                views.exists(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], function(err, exists) {
                    var customerdb = flatpack.use('customer');
                    if (err || !exists) return ready(err);
                    async.forEach(customers, function(customer, callback) {
                        customerdb.save(customer, callback);
                    }, ready);
                });
            }); 
        },
        function(ready) {
            flatpack.define(config.couchurl, config.db, 'product', null, function(err) {
                if (err) return ready(err);
                var productsdb = flatpack.use('product');
                async.forEach(products, function(product, callback) {
                    productsdb.save(product, callback);
                }, ready);
            });
        }
        ], callback);   
}

describe('defining a flatpack model definition', function() {
    
    // Drop and create database each time
    before(function(done) {
        db.remove(config.db, function() {done();});
    });

    beforeEach(function(done) {
        db.create(config.db, done);
    });
    
    afterEach(function(done) {
        db.remove(config.db, done);
    });
    
    // Start tests
    it('should define and create a model with a default view', function(done) {
    
        flatpack.define(config.couchurl, config.db, 'customer', function(err) {
            if (err) return done(err);
            views.exists(config.couchurl, config.db, 'customer', null, function(err, exists) {
                if (err || !exists) return done(err);
                return done();
            });
        });
    });

    it('should define and create a model with a complex view', function(done) {
    
        flatpack.define(config.couchurl, config.db, 'customer', {views: {byName: ['firstName', 'lastName']}}, function(err) {
            if (err) return done(err);
            views.exists(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], function(err, exists) {
                if (err || !exists) return done(err);
                return done();
            });
        });
    });

    it('should be able to save an object using a defined object and can retrieve by id, delete, and not retrieve', function(done) {
        
        var customer = {firstName: 'Nathan', lastName: 'Oehlman', company: 'Sidelab'},
            customerdb = flatpack.use('customer');
            
        customerdb.save(customer, function(err, id) {
            if (err) return done(err);
            customerdb.get(id, function(err, object) {
                if (err) return done(err);
                expect(object.firstName).to.equal('Nathan');
                
                // Try deleting
                customerdb.delete(object, function(err) {
                    if (err) return done(err);
                    customerdb.get(id, function(err, object) {
                        if (err) return done();
                        return done('Object still exists');
                    });
                });
            });
        });
    });

    it('should be able to get all instances of the object by type', function(done) {
        
        var customerdb = flatpack.use('customer');
        
        prepare(function(err) {
            if (err) return done(err);
            customerdb.findAll(function(err, results) {
                if (err) return done(err);
                expect(results.total_rows).to.equal(2);
                expect(results.rows.length).to.equal(2);
                done();
            });
        });
        
    });
    
    it('should be able to get specific instances of an object using a custom view', function(done) {
        
        var customerdb = flatpack.use('customer');

        prepare(function(err) {
            if (err) return done(err);
            customerdb.findByFirstName({key: 'Nathan'}, function(err, results) {
                if (err) return done(err);
                // Check we have the correct results
                expect(results.total_rows).to.equal(2);
                expect(results.offset).to.equal(1);
                expect(results.rows.length).to.equal(1);
                expect(results.rows[0].value.firstName).to.equal('Nathan');
                done();
            });
        });         
        
    });
    
});