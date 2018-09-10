# Express Router Factory

> Router Factory is a boilerplate for express routers endpoints. It came with predefined middlewares/validators and also provide the possibility to include custom ones. It allows population and projection

## Basic usage

> I take as an example a fictional 'Notes' model

```Javascript
...

const Notes = require('../../models/Notes.model');
const router = express.Router();

const RF = new RouterFactory(router, Notes);

// Set Population for all CRUD endpoints
RF.setPopulate({ users: { __v: 0, notes: 0, password: 0 } });

// If you only need to build a GET endpoint.
RF.GET('/');


// ... if you want to add custom middlewares to this endpoint.
RF.GET('/', custom_middleware);

// Create all CRUD endpoints.
RF.CRUD();


function custom_middleware(req, res, next) {
  // some middleware code here.
}
...
```
