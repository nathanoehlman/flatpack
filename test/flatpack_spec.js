var expect = require('chai').expect,
    flatpack = require('../flatpack'),
    views = require('../lib/views'),
    config = require('config');

describe('defining a flatpack model definition', function() {
    
    it('should define and create a model with a default view', function(done) {
    
        flatpack.define(config.couchurl, config.db, 'customer', null, function(err) {
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
    
});