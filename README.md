# Express Router Factory

> Router Factory is a boilerplate for express routers endpoints. It came with predefined middlewares/validators and also provide the possibility to include custom ones. It allows population and projection

# Installation

```
  yarn add express-router-factory
```

## Basic usage

> I take as an example a fictional 'Notes' and 'User models

```Javascript
// Notes.model.js
const Notes = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    default: 'Add your fancy notes here.',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  users: [
    {
      type: ObjectId,
      ref: 'Users',
      required: true,
    },
  ],
});

// User.model.js
const Users = new Schema({
  name: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  notes: [{ type: ObjectId, ref: 'Notes' }],
});
```

### Implement a router for the Notes models with all CRUD endpoints.

```Javascript
// notes.router.js

const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

const RF = new RouterFactory(router, Notes); // Create a Router Factory instance

// Create all CRUD endpoints.
RF.CRUD();  // That is all you need.
```

That is all you need, now a GET, POST, PUT and DELETE enpoints are defined for the 'Notes' model.
See [METHODS section](#METHODS) for more datails.

### Define only a GET endpoint

> For the following example consider that the `server.js` file has the following endpoint defined:

```Javascript
// server.js

const notesRouter = require('path/to/routers/Notes.router'); // Import our notes router

...

server.use('/api/notes', notesRouter); // Define an API enpoint for our 'Notes' model.
```

> If you only need to build a GET endpoint at `api/notes/`.

```Javascript
// notes.router.js

const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

// Create a Router Factory instance, pass to the constructor your 'router' and 'Notes' instances as parameters.
const RF = new RouterFactory(router, Notes);

// If you only need to build a GET endpoint at `"api/"`.
RF.GET();
```

But this is no always true, it will be nice to have the flexibility to define our enpoints paths, you can do it!

> For example, lets define an enpoint at _api/notes/`favorites`_:

```Javascript
// notes.router.js

const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

// Create a Router Factory instance, pass to the constructor your 'router' and 'Notes' instances as parameters.
const RF = new RouterFactory(router, Notes);

// If you only need to build a GET endpoint at "api/notes/favorites".
RF.GET("/favorites");
```

That is, now we have an API enpoint at `api/notes/favorites` for our 'Notes' model.
See [METHODS section](#METHODS) for more datails.

---

# METHODS

## CRUD

This method builds a GET, POST, PUT and DELETE enpoints for the Model passed to the RouterFactory.

> The logic it applies is the following:

```Javascript
// server.js

    router
      .route('/')
      .get(handleGET, sendResponseToClient)
      .post(
        checkForRequiredFields,
        handlePOST,
        sendResponseToClient
      );

    router
      .route('/:id')
      .get(
        isIdValid,
        handleGET,
        sendResponseToClient
      )
      .put(
        isIdValid,
        handlePUT,
        sendResponseToClient
      )
      .delete(
        isIdValid,
        handleDELETE,
        sendResponseToClient
      );

    router.use(handleError);
```

## GET

This method builds a GET enpoint at `"/"` path by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
GET(path = '/') {
    router.route(path).get(handleGET, sendResponseToClient)
    router.use(handleError);
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

## GET_id

This method builds a GET enpoint at `/:id` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
GET_id(path = '/:id') {
    router.route(path).get(isIdValid, handleGET, sendResponseToClients)
    router.use(handleError);
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

## POST

This method builds a POST enpoint at `/` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
POST(path = '/') {
    router.route(path).post(checkForRequiredFields, handlePOST, sendResponseToClient);
    router.use(handleError);
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.

## PUT

This method builds a PUT enpoint at `/:id` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
PUT(path = '/:id') {
    router.route(path).put(isIdValid, handlePUT, sendResponseToClient)
    router.use(handleError);
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

## DELETE

This method builds a DELETE enpoint at `/:id` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
DELETE(path = '/:id') {
    router.route(path).delete(isIdValid, handleDELETE, sendResponseToClient);
    router.use(handleError);
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

# BUILT-IN HANDLERS

## handleGET

This handler manage the following endpoints:

> router.route('/').get(..)

> router.route('/:id').get(..)

```Javascript
  function handleGET(req, res, next) {
    const { id } = req.params;
    let fetching = !id ? this.Model.find({}, {}) : this.Model.find({ _id: id }, {});

    // Populate the query
    this._toPopulate && this._toPopulate.forEach(join => fetching.populate(join[0], join[1]));
    // Project the query
    this._setProjection && fetching.select(this._setProjection);

    fetching.exec(function(err, response) {
      if (err) {
        !id
          ? next(createError(500, 'The information could not be retrieved.'))
          : next(500, 'The information could not be retrieved.');
      } else {
        req.responseDocument = response;
        next();
      }
    });
  }
```

## handlePOST

```Javascript
  function handlePOST(req, res, next) {
    const parameters = req.body;
    console.log('hanlde POST');
    const toPost = this.newModel(parameters);
    toPost
      .save()
      .then(newDocument => {
        // res.status(201).json(newDocument);
        req.responseDocument = newDocument;
        next();
      })
      .catch(e => {
        next(e);
      });
  }
```

## handlePUT

```Javascript
  function handlePUT(req, res, next) {
    const { id } = req.params;
    const { ...toUpdate } = req.toUpdate || req.body;
    this.Model.findByIdAndUpdate(id, toUpdate, { new: true, runValidators: true })
      .then(response => {
        req.responseDocument = response;
        next();
      })
      .catch(e => {
        next(e);
      });
  }
```

## handleDELETE

```Javascript
  function handleDELETE(req, res, next) {
    const { id } = req.params;

    this.Model.findByIdAndRemove(id)
      .then(response => {
        req.responseDocument = response;
        next();
      })
      .catch(e => {
        next(createError(500, 'The document could not be removed'));
      });
  }
```

# BUILT-IN MIDDLEWARES

## isIdValid

```Javascript
  function isIdValid(req, res, next) {
    const { id } = req.params;
    if (!id) return next();

    this.Model.findById(id)
      .then(idFound => {
        return idFound ? next() : next(createError(404, 'The data with the specified ID does not exist.'));
      })
      .catch(e => {
        next(e);
      });
  }
```

## checkForRequiredFields

```Javascript
// If there are missing 'required' fields next(error) else next()
  function checkForRequiredFields(req, res, next) {
    const params = { ...req.body };

    // Create new Mongose document with the parameters passed in the req.body
    new this.Model(params).validate(error => {
      // Extract missing required fields.
      let missingRequiredFields;

      error && (missingRequiredFields = Object.keys(error.errors));

      // if there are missing-required-fields ? next(error) : next()
      missingRequiredFields
        ? // Responde with a custom Error messages that contain the missing-required-fields
          next(createError(400, `The following field(s) are required: ${missingRequiredFields.join(', ')}`))
        : // Continue to next middleware
          next();
    });
  }
```

## sendResponseToClient

```Javascript
  function sendResponseToClient(req, res, next) {
    const endpoint = req.baseUrl;
    const method = req.method;
    // console.log({ method });
    const document = req.responseDocument || req.updatedDocument;

    const anexToResponse = {
      GET: 'in database',
      POST: 'created',
      PUT: 'modified',
      DELETE: 'deleted',
    }[method];

    res.status(200).json({ [`Document(s) ${anexToResponse}`]: document });
  }
```

## excludeUniqueFieldsFromPUT

```Javascript
  function excludeUniqueFieldsFromPUT(req, res, next) {
    const toUpdate = { ...req.body };
    const entries = Object.entries(this.Model.schema.paths);

    entries.forEach(entrie => {
      const pathName = entrie[0];

      const pathProperties = entrie[1];
        /**
         * if a 'path' is set to be 'unique' in the Schema: => delete that path from the 'toUpdate' object.
         * Thus: the 'unique' path does not get updated.
         */
        // if (pathProperties.options.unique == true) parameters[pathName] = null;
        pathProperties.options.unique == true && delete toUpdate[pathName];
    });

    // Pass the parameters with the adjustments to the next middleware handler
    req.toUpdate = toUpdate;
    next();
  }
```

# WORK IN PROGRESS

> THIS DOCUMENTATION IS IN PROCESS OF BEING WRITTEN. Apologies for the missing information. Please contact me if you need some help.

```Javascript
const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

// Create a Router Factory instance, pass to the constructor your 'router' and 'Notes' instances as parameters.
const RF = new RouterFactory(router, Notes);

// Set Population for all CRUD endpoints
RF.setPopulate({ users: { __v: 0, notes: 0, password: 0 } });

// Set projections for all CRUD endpoints
RF.setProjection({ password: 0 });  // Do not send to the client the User's password

// If you only need to build a GET endpoint.
RF.GET('/');

// If you want to define a 'login' endpoint
RF.POST('/login)', 'login', function yourCustomLoginHandler(req, res, next){..some nice code here...} );

// ... if you want to add custom middlewares to any endpoint.
RF.GET('/', custom_middleware_1, ..., custom_middleware_n);
RF.POST('/', custom_middleware_1, ..., custom_middleware_n);
RF.PUT('/:id', custom_middleware_1, ..., custom_middleware_n);
RF.DELETE('/:id', custom_middleware_1, ..., custom_middleware_n);

// Create all CRUD endpoints.
RF.CRUD();


function custom_middleware_1(req, res, next) {
  // some middleware code here.
}
function custom_middleware_n(req, res, next) {
  // some middleware code here.
}
```
