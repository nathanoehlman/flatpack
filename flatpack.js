var models = {},
    supercomfy = require('supercomfy'),
    config = require('config'),
    views = require('./lib/views')
    async = require('async'),
    _ = require('underscore'),
    debug = require('debug')('flatpack');

/**
  Defines a model, checking with the CouchDB database
  to determine if the model exists; creates any views
  that do not exists, and create a model helper which
  exposes those methods for easy use.
 **/
exports.define = function(couchurl, db, model, options, callback) {

    if (!model || model.length == 0) return callback("Error: Invalid model name");
    
    // Get the views
    var modelViews = {byType: []},
        accessor = new Accessorizer(model, couchurl, db);
        
    _.extend(modelViews, (options && options.views) ? options.views : {});
    
    // Create a view
    function createView(viewName, attributes, callback) {
        views.createIfNotExists(couchurl, db, model, attributes, null, function(err, designName, dbView) {
            if (err) return callback(err)
            
            if (attributes && attributes.length > 0) {
                // Create the accessor, with args as params
            } else {
                // Create the accessor
                accessor['find' + viewName] = function(id, done) {
                    var db = this._getDB();
                    db.get(designName + '/view/' + dbView, {key:id}, done);
                };
                
            }
            return callback();
        });
    }
    
    // Create all views
    async.forEach(_.keys(modelViews), 
                  function(key, callback) {
                     createView(key, modelViews[key], callback)
                  },
                  function(err) {
                     if (err) {
                        // TODO: Maybe get rid of the model definition
                        return callback(err);
                     }
                     models[model] = accessor;
                     return callback(null, accessor);
                  });
}

/**
  Returns a data accessor for the given model
 **/
exports.use = function(model) {
    if (models && models[model]) {
        return models[model];
    }
    debug('Model [' + model + '] not defined. Define with flatpack.define() first');
    return null;
}

/**
  DataAccessor is the base class which is used to create
  the helpers for the models
 **/
function Accessorizer(model, server, db) {
    this.def = model;
    this.server = server;
    this.db = db;
}

Accessorizer.prototype = {

    /**
      Saves an instance of the object, will return the saved objects id
      as the second parameter of the callback. ie. callback(err, id);
     **/
    save: function(object, callback) {
        // Get values of the object
        var db = this._getDB(),
            data = {type: this.def},
            id = (object && object._id) ? object._id : null;
        _.extend(data, object);
        
        // Save the document
        function saveDocument(data, callback) {
            // Create a document for the client in the clients database
            db.put(id, data, function(err) {
                if (err) return callback(err);
                return callback(err, id);
            });
        }
        
        // Check if this is an update
        if (!id) {
            // Get the UUID for the document
            this._getUUID(function(err, uuid) {
                if (err) return callback(err);
                id = data['_id'] = uuid.uuids[0];
                saveDocument(data, callback);
            }); 
        } else {
            saveDocument(data, callback);
        }
    
    },
    
    /**
      Deletes an instance of the object
     **/
    delete: function(object, callback) {
        if (!object) return callback();
		var db = this._getDB();
		// Delete the object using the revision of the current doc
		db.del(object._id, {rev:object._rev}, callback);
    },
    
    /**
      Gets the instance of the object denoted by id, or null
     **/
    get: function(id, callback) {
        if (!id) return callback("Error: No id supplied");
        var db = this._getDB();
        // Create a document for the client in the clients database
        db.get(id, null, function(err, object) {
            if (err) return callback(err);
            return callback(err, object);
        });     
    },
    
    /**
      Returns an instance of the db for this helper
     **/
    _getDB: function() {
        return supercomfy(this.server).use(this.db);
    },
    
    /**
      Returns a generated UUID from couch to use as the id
     **/
    _getUUID: function(callback) {
        var db = supercomfy(config.couchurl);;      
        db.get('_uuids', null, callback);
    }
    
};

