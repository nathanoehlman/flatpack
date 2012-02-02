var supercomfy = require('supercomfy');

/**
  DataAccessor is the base class which is used to create
  the helpers for the models
 **/
function Accessorizer(model, server, db) {
    this.def = model;
    this.server = server;
    this.db = db;
    this.ready = false;
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
        var db = supercomfy(this.server);
        db.get('_uuids', null, callback);
    }
    
};

module.exports = Accessorizer;