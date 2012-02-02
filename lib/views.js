var _ = require('underscore'),
    _s = require('underscore.string'),
    dbhelper = require('./helpers/dbhelper'),
    view_prefix = "by",
    delimiter = "_",
    design_prefix = "_design/";

/**
  Creates a view for the given model and attributes on the couch database =
 **/
exports.create = function(couchurl, db, model, attributes, options, callback) {

    var that = this;
    // Get the design from the DB (if it exists)
    this.getDesign(couchurl, db, model, function(err, design) {
        
        // Determine whether this is an update or not
        var revision = (!err && design._rev) ? design._rev : null,
            doc = null,
            viewName = _getViewName(model, attributes);
        // Create (or assign) the design doc
        if (err) {
            doc = {language: "javascript", views: {}};
        } else {
            doc = design;
            if (!doc.views) doc.views = {};
        }
        
        // Create the map function for the attributes
        doc.views[viewName] = {map: createMapFunction(model, attributes)};
        
        // Store the design back in couch
        var dbs = dbhelper.getDB(couchurl, db);
        dbs.put(_getDesignName(model), JSON.stringify(doc), function(err) {
            if (err) return callback('Error: Could not create view [' + viewName + '] - ' + err);
            return callback(null, _getDesignName(model), viewName);
        });
    });
}

/**
  Creates the given view if it doesn't already exist.
**/ 
exports.createIfNotExists = function(couchurl, db, model, attributes, options, callback) {
    
    var that = this;
    // Check for the existence of the view
    this.exists(couchurl, db, model, attributes, function(err, found) {
        if (err) return callback(err);
        if (found) return callback(null, _getDesignName(model), _getViewName(model, attributes));
        // Doesn't exist, so create
        that.create(couchurl, db, model, attributes, options, callback);
    });
}

/**
  Indicates whether the given view exists in the database
 **/
exports.exists = function(couchurl, db, model, attributes, callback) {
    
    // Get the design
    this.getDesign(couchurl, db, model, function(err, design) {
        if (err && !err.error == 'not_found') return callback(err);
        // Check if an appropriately named view already exists
        return callback(null, !err && design.views && design.views[_getViewName(model, attributes)]);
    });
    
}

/**
  Deletes the view if it exists
 **/
exports.delete = function(couchurl, db, model, attributes, callback) {
    
    var that = this;
    // Get the design from the DB (if it exists)
    this.getDesign(couchurl, db, model, function(err, doc) {
        
        var viewName = _getViewName(model, attributes);
        
        // No design exists, so don't bother
        if (err || !doc || !doc.views || !doc.views[viewName]) return callback();
                    
        // Delete the view
        delete doc.views[viewName];
        
        // Store the design back in couch
        var dbs = dbhelper.getDB(couchurl, db);
        dbs.put(_getDesignName(model), JSON.stringify(doc), function(err) {
            if (err) return callback('Error: Could not update/delete view - ' + err);
            return callback();
        });
    });
}

/**
  Returns design document for the given model (if it exists)
 **/
exports.getDesign = function(couchurl, db, model, callback) {
    var db = dbhelper.getDB(couchurl, db);
    db.get(_getDesignName(model), null, callback);
}

/**
  Returns the design name in couch
 **/
exports._getDesignName = _getDesignName = function(model) {
    return design_prefix + _getModelName(model);
}

/**
  Returns an escaped variant of the model
 **/
exports._getModelName = _getModelName = function(model) {
    return _.escape(model);
}

/**
  Returns the name of the view according to convention
 **/
exports._getViewName = _getViewName = function(model, attributes) {
    var values = [view_prefix].concat((attributes && attributes.length > 0) ? attributes : null || ['type']);
    return _s.camelize(values.join(delimiter));
}

/**
  Creates a map function for the given model with the indicated attributes
 **/
exports._createMapFunction = createMapFunction = function(model, attributes) {
    
    var emit = "emit(";
    // If more than one attribute, it needs to be a combined map function (ie. [attr1, attr2], doc);
    if (attributes && attributes.length > 1) {
        emit += "[";
        _.each(attributes, function(attr, idx) {
            emit += ((idx > 0) ? ',' : '') + 'doc.' + attr;
        });
        emit += "]";
    }
    // If one attribute, then normal map function
    else if (attributes && attributes.length == 1) {
        emit += 'doc.' + attributes[0];
    }
    // We grab everything 
    else {
        emit += 'doc.id';
    }
    emit += ", doc);";
    return "function(doc) { if (doc.type == '" + model + "') { " + emit + " } }";
}