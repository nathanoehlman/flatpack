# Flatpack

Flatpack provides some simple document modelling for CouchDB built on top of [supercomfy](https://github.com/sidelab/supercomfy) CouchDB client. Flatpack will allow you to define a model, and will then create appropriate permanent views in CouchDB to allow for easy searching and retrieval of these documents, as well as creating a helper object which will allow you to easily manipulate documents of that type.  

## Goals

- Provide alternate client implementations (use either supercomfy, cradle or nano)
- Use Travis-CI for continuous integration

## Example

### Defining a model

``` js
    // Define a model with just the default view (getByType)
    flatpack.define(couchurl, db, 'customer', null, callback);

    // Define a model with custom views
    flatpack.define(couchurl, db, 'customer', {views: {byName: ['firstName', 'lastName'], byCompany: ['company']}}, callback);
```

### Saving an object

``` js
    // Create a document
    var customer = {firstName: 'Nathan', lastName: 'Oehlman', company: 'Sidelab'},
        customerdb = flatpack.use('customer');
    
    // Save for the first time
    customerdb.save(customer, function(err, id) {
        // id is the id assigned by couch to the document
    });

```

### Getting and updating object

``` js
    // Create a document
    var customerdb = flatpack.use('customer');
    
    // Get the existing object
    customerdb.get(id, function(err, object) {
        if (!err) {
            // Update the details
            object.firstName = 'Thomas';
            customerdb.save(object, function(err, id)) {
                if (!err) {
                    // All ok!
                }
            });
        }
    });
```

### Using a view ###

By default, flatpack will create a default view that can access all documents of the type.

``` js
	// Get all customer documents
	var customerdb = flatpack.use('customer');
	customerdb.findByType(function(err, results) {
		// returns a CouchDB results
		// ie. {total_rows: x, offset: x, rows: [documents]}
	});
	
	// Can also be accessed using the all alias
	customerdb.all(function(err, results) {
		// etc
	});
	
```

Using a custom view is also very similar. 

``` js
	// Get all customer documents belonging to the Sidelab company
	var customerdb = flatpack.use('customer');
	// An argumented view takes an opts object, that gets converted into Couch DB view parameters (so you can use startKey, endKey, etc)
	customerdb.findByCompany({key: 'Sidelab'}, function(err, results) {
		// same as before - a CouchDB result set
	});
	
```