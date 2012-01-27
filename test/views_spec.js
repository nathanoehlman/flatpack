var expect = require('chai').expect,
    views = require('../lib/views'),
    client = 'test-' + new Date().getTime(),
    config = require('config');

describe('views should be named, detected and created, and destroyed appropriately', function() {
    
    it('should name views correctly', function(done) {
        expect(views._getViewName('client', ['type'])).to.equal('by_type');
        expect(views._getViewName('client', ['firstName', 'lastName'])).to.equal('by_firstName_lastName');
        done();
    });
    
    it('should create appropriate map functions', function(done) {
        expect(views._createMapFunction('client', null)).to.equal('function(doc) { if (doc.Type == \'client\') { emit(doc.id, null); } }');
        expect(views._createMapFunction('client', ['name', 'suburb'])).to.equal('function(doc) { if (doc.Type == \'client\') { emit([doc.name,doc.suburb], null); } }');
        done();
    });
    
    it('should be able to create a default view document', function(done) {
        views.create(config.couchurl, config.db, 'customer', null, null, done);
    });
    
    it('should be able to create a complex view document', function(done) {
        views.create(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], null, done);
    });
    
    it ('should be able to test for the existence of default view', function(done) {
        views.exists(config.couchurl, config.db, 'customer', null, function(err, exists) {
            if (err && !exists) return done(err);
            done();
        });
    });
    
    it ('should be able to test for the existence of complex view', function(done) {
        views.exists(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], function(err, exists) {
            if (err && !exists) return done(err);
            done();
        });
    });
    
    it('should be able to delete default view', function(done) {
        views.exists(config.couchurl, config.db, 'customer', null, function(err, exists) {
            if (err || !exists) return done(err);
            views.delete(config.couchurl, config.db, 'customer', null, function(err) {
                if (err) return done(err);
            
                views.exists(config.couchurl, config.db, 'customer', null, function(err, exists) {
                    if (err || exists) return done(err);
                    return done();
                });
            });
        });
    });
    
    it('should be able to delete complex view', function(done) {
        views.exists(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], function(err, exists) {
            if (err || !exists) return done(err);
            views.delete(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], function(err) {
                if (err) return done(err);

                views.exists(config.couchurl, config.db, 'customer', ['firstName', 'lastName'], function(err, exists) {
                    if (err || exists) return done(err);
                    return done();
                });
            });
        });
    });
    
});