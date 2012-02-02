var supercomfy = require('supercomfy');

/**
  Returns a supercomfy db accessor for the given server and database
 **/
exports.getDB = function(couchUrl, db) {
    return supercomfy(couchUrl).use(db);
}