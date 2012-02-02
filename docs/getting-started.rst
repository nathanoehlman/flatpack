.. highlight:: javascript

.. _getting-started:

===============
Getting Started
===============

Flatpack is designed to feel similar to working with other ORM layers, but at the same time not hide away the RESTfulness of CouchDB. 

Defining a Model
================

To get started, the first thing you must do is define a model.  In this case we will simply let Flatpack know that we want a model of type ``customer``.

.. literalinclude:: ../examples/define-customer.js

This model is quite possibly too simple to be useful, but it will do for now.  We'll cover :ref:`initializing-views` soon which will create us something genuinely helpful.

Saving Data
===========

Once a model is defined, its simple to save an object to the db.  In flatpack, you don't need to pass in a special kind of object to save it - just a plain old Javascript object.

.. literalinclude:: ../examples/save-customer.js

