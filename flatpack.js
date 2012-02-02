var models = {},
    views = require('./lib/views')
    async = require('async'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    debug = require('debug')('flatpack'),
    Accessorizer = require('./lib/accessorizer'),
    pipe = require('piper')('flatpack');

/**
  Defines a model, checking with the CouchDB database
  to determine if the model exists; creates any views
  that do not exists, and create a model helper which
  exposes those methods for easy use.
 **/
exports.define = function(couchAdminUrl, db, model, options, callback) {
    if (!model || model.length == 0) return callback("Error: Invalid model name");
    
    // Allow for options to be omitted
    if (typeof options == 'function' && arguments.length == 4) {
        callback = options;
        options = null;
    }
    
    // Get the views
    var modelViews = {all: []},
        accessor = models[model] = new Accessorizer(model, (options && options.couchUrl) ? options.couchUrl : couchAdminUrl, db);
        
    _.extend(modelViews, (options && options.views) ? options.views : {});
    
    // Create a view
    function createView(viewName, attributes, callback) {
        views.createIfNotExists(couchAdminUrl, db, model, attributes, null, function(err, designName, dbView) {
            if (err) return callback(err)
            
            var funcName = 'find' + _s.camelize('_' + viewName),
                view = designName + '/_view/' + dbView;
            
            if (attributes && attributes.length > 0) {
                accessor[funcName] = function(opts, done) {
                
                    var jsonified = {};
                    _.each(opts, function(value, key, list) {
                        jsonified[key] = JSON.stringify(value);
                    });
                    this._getDB().get(view, jsonified, done);
                };
                // Create the accessor, with args as params
            } else {
                // Create the default accessor
                accessor[funcName] = accessor['all'] = function(done) {
                    this._getDB().get(view, null, done);
                };
                
            }
            return callback();
        });
    }
    
    // Create all views
    async.forEachSeries(_.keys(modelViews), 
                  function(key, callback) {
                     createView(key, modelViews[key], callback)
                  },
                  function(err) {
                     if (err) {
                        // TODO: Maybe get rid of the model definition
                        return callback(err);
                     }
                     accessor.ready = true;
                     pipe('defined.' + model, models[model]);
                     return callback(null, accessor);
                  });
}

/**
  Returns a data accessor for the given model
 **/
exports.use = function(model, callback) {
    // Check if the model is being defined or is defined
    if (models && models[model]) {
        var accessor = models[model];
        
        // Check the readiness of the model
        if (accessor.ready) {
            if (callback) {
                callback(null, accessor);
            } 
            return accessor;
        } else {
            // Not ready
            if (callback) {
                pipe.once('defined.' + model, function(accessor) {
                    callback(null, accessor);
                });
            }
            debug('Model [' + model + '] not yet available for use.');
            return null;
        }
    }
    
    // Not defined, so nothing we can do
    debug('Model [' + model + '] not defined. Define with flatpack.define() first');
    if (callback) {
        callback('Error: ' + model + ' not defined');
    }
    return null;
}