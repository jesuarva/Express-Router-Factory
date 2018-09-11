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

> Implement router for the Notes models with all CRUD endpoints.

```Javascript
const Notes = require('path/to/models/Notes.model'); // Import our notes model
const router = express.Router(); // Create a 'router' instance

const RF = new RouterFactory(router, Notes); // Create a Router Factory instance

// Create all CRUD endpoints.
RF.CRUD();  // That is all you need.
```

That is all you need, now a GET, POST, PUT and DELETE enpoints are defined for the 'Notes' model.
See [CRUD section](##CRUD) for a more datails .

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
    .delete(isIdValid, handleDELETE);

  router.use(handleError);
```
