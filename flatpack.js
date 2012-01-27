var models = {},
    supercomfy = require('supercomfy'),
    config = require('config'),
    views = require('./lib/views');

/**
  Defines a model, checking with the CouchDB database
  to determine if the model exists; creates any views
  that do not exists, and create a model helper which
  exposes those methods for easy use.
 **/
exports.define = function(db, model, options, callback) {

    
    
}

/**
  Returns a data accessor for the given model
 **/
exports.use = function(model) {
    
}

/**
  DataAccessor is the base class which is used to create
  the helpers for the models
 **/
function DataAccessor(model, db) {
    this.def = model;
    this.db = db;
}

DataAccessor.prototype = {

    /**
      Saves an instance of the object
     **/
    save: function(object, callback) {
        
    },
    
    /**
      Deletes an instance of the object
     **/
    delete: function(object, callback) {
        
    },
    
    /**
      Gets the instance of the object denoted by id, or null
     **/
    get: function(id, callback) {
        
    },
    
    /**
      Returns an instance of the db for this helper
     **/
    _db: function() {
        return supercomfy(config.couchurl).use(this.db);
    }
    
};

