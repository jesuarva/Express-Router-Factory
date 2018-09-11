# Express Router Factory

> Router Factory is a boilerplate for express routers endpoints. It came with predefined middlewares/validators and also provide the possibility to include custom ones. It allows population and projection

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
const Notes = require('path/to/models/Notes.model'); // Import our notes model

...

server.use('/api/notes', notesRouter); // Define an API enpoint for our 'Notes' model.
```

> If you only need to build a GET endpoint at `api/notes/`.

```Javascript
const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

// Create a Router Factory instance, pass to the constructor your 'router' and 'Notes' instances as parameters.
const RF = new RouterFactory(router, Notes);

// If you only need to build a GET endpoint at `"api/"`.
RF.GET();
```

But this is no always true, it will be nice to have the flexibility to define our enpoints paths, you can do it!

> For example, lets define an enpoint at api/notes/`favorites`:

```Javascript
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
  router
    .route('/')
    .get(handleGET, sendResponseToClient)
    .post(validateParameters, handlePOST, sendResponseToClient);

  router
    .route('/:id')
    .get(isIdValid, handleGET, sendResponseToClients)
    .put(isIdValid, validateParameters, excludeUniqueFieldsFromPUT, handlePUT, sendResponseToClient)
    .delete(isIdValid, handleDELETE, sendResponseToClient);

  router.use(handleError);
```

## GET

This method builds a GET enpoint at `/` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
GET(path = '/') {
    router.route(path).get(handleGET, sendResponseToClient)
    router.use(handleError.bind(this));
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

## GET_id

This method builds a GET enpoint at `/:id` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
GET_id(path = '/:id') {
    .get(isIdValid, handleGET, sendResponseToClients)
    router.use(handleError.bind(this));
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

## POST

This method builds a POST enpoint at `/` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
POST(path = '/') {
    router.route(path).post(validateParameters, handlePOST, sendResponseToClient);
    router.use(handleError.bind(this));
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.

## PUT

This method builds a PUT enpoint at `/:id` by default. But you can pass your own path if desired.

> The logic it applies is the following:

```Javascript
PUT(path = '/:id') {
    router.route(path).put(isIdValid, validateParameters, excludeUniqueFieldsFromPUT, handlePUT, sendResponseToClient)
    router.use(handleError.bind(this));
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
    router.use(handleError.bind(this));
  }
```

In the sake of simplicity, I'm omiting the second parameter this method expect, but do not worry, the behaivor of this method do not change.
I'll cover that later on in the [PREDEFINED MIDDLEWARE Section](#PREDEFINED-MIDDLEWARE)

# NOTE: Work in progress

> THIS DOCUMENTATION IS IN PROCESS OF BEING WRITTEN. Apologies for the missing information. Please contact me if you need some help.

```Javascript
const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

// Create a Router Factory instance, pass to the constructor your 'router' and 'Notes' instances as parameters.
const RF = new RouterFactory(router, Notes);

// Set Population for all CRUD endpoints
RF.setPopulate({ users: { __v: 0, notes: 0, password: 0 } });

// If you only need to build a GET endpoint.
RF.GET('/');


// ... if you want to add custom middlewares to this endpoint.
RF.GET('/', custom_middleware_1, ..., custom_middleware_n);

// Create all CRUD endpoints.
RF.CRUD();


function custom_middleware_1(req, res, next) {
  // some middleware code here.
}
function custom_middleware_n(req, res, next) {
  // some middleware code here.
}
```
