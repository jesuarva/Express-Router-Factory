module.exports = class routerFactory {
  constructor(router, Model) {
    this.hello = 'Hello from Router Factory instance';
    this.router = router;
    this._setProjection;
    this._toPopulate = [];

    // Make a reference to 'Model'
    this.Model = Model;
  }
  // This line allow create a new instance of the Model -> needed to create a new Document.
  newModel(arg) {
    const Model = this.Model;
    return new Model(arg);
  }

  sayHello(text) {
    console.log('Hello form %s instance', text);
  }

  GET(path = '/', ...middlewares) {
    let handlers = [];
    let options = {};

    // Fill the 'handlers' array
    buildHandlers.call(this, 'GET', options, handlers, middlewares);

    this.router.route(path).get(...handlers, sendResponseToClient.bind(this));
    this.router.use(handleError.bind(this));
  }

  GET_id(path = '/:id', ...middlewares) {
    let handlers = [];
    let options = {};

    // Fill the 'handlers' array
    buildHandlers.call(this, 'GET', options, handlers, middlewares);

    this.router
      .route(path)
      .get(isIdValid.bind(this), ...handlers, sendResponseToClient.bind(this));
    this.router.use(handleError.bind(this));
  }

  POST(path = '/', ...middlewares) {
    let handlers = [];
    let options = {
      login: false,
    };

    // Fill the 'handlers' array
    buildHandlers.call(this, 'POST', options, handlers, middlewares);

    if (options.login) {
      this.router
        .route(path)
        .post(...handlers, sendResponseToClient.bind(this));
    } else {
      this.router
        .route(path)
        .post(
          checkForRequiredFields.bind(this),
          ...handlers,
          sendResponseToClient.bind(this),
        );
    }
    this.router.use(handleError.bind(this));
  }

  PUT(path = '/:id', ...middlewares) {
    let handlers = [];
    let options = {};

    // Fill the 'handlers' array
    buildHandlers.call(this, 'PUT', options, handlers, middlewares);

    this.router
      .route(path)
      .put(isIdValid.bind(this), ...handlers, sendResponseToClient.bind(this));
    this.router.use(handleError.bind(this));
  }

  DELETE(path = '/:id', ...middlewares) {
    let handlers = [];
    let options = {};

    // Fill the 'handlers' array
    buildHandlers.call(this, 'DELETE', options, handlers, middlewares);

    this.router
      .route(path)
      .delete(
        isIdValid.bind(this),
        ...handlers,
        sendResponseToClient.bind(this),
      );
    this.router.use(handleError.bind(this));
  }

  CRUD() {
    this.router
      .route('/')
      .get(handleGET.bind(this), sendResponseToClient.bind(this))
      .post(
        checkForRequiredFields.bind(this),
        handlePOST.bind(this),
        sendResponseToClient.bind(this),
      );

    this.router
      .route('/:id')
      .get(
        isIdValid.bind(this),
        handleGET.bind(this),
        sendResponseToClient.bind(this),
      )
      .put(
        isIdValid.bind(this),
        handlePUT.bind(this),
        sendResponseToClient.bind(this),
      )
      .delete(
        isIdValid.bind(this),
        handleDELETE.bind(this),
        sendResponseToClient.bind(this),
      );

    this.router.use(handleError.bind(this));
  }
  setProjection(projections) {
    this._setProjection = projections;
  }
  setPopulate(...arg) {
    arg.forEach((arg) => {
      switch (typeof arg) {
        case 'string':
          this._toPopulate.push([arg, {}]);
          break;
        case 'object':
          const path = Object.keys(arg)[0];
          this._toPopulate.push([path, arg[path]]);
      }
    });
    // console.log('toPopulate', this._toPopulate);
  }
};

/** ------------------------------------------------------------------------------ */
/**
 * THESE FOLLOWING FUNCTIONS ARE NO AIM TO BE ACCESIBLE AS A 'routerFactory' METHOD.
 * THUS -> ARE NO DECLARED AS CLASS METHODS
 */
/** ------------------------------------------------------------------------------ */

/**
 * ROUTER HANDLERS: handle endpoints
 */
function handlePOST(req, res, next) {
  const parameters = req.body;
  console.log('hanlde POST');
  const toPost = this.newModel(parameters);
  toPost
    .save()
    .then((newDocument) => {
      // res.status(201).json(newDocument);
      req.responseDocument = newDocument;
      next();
    })
    .catch((e) => {
      next(e);
    });
}
function handleGET(req, res, next) {
  const { id } = req.params;
  let fetching = !id
    ? this.Model.find({}, {})
    : this.Model.find({ _id: id }, {});

  // Populate the query
  this._toPopulate &&
    this._toPopulate.forEach((join) => fetching.populate(join[0], join[1]));
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
function handleDELETE(req, res, next) {
  const { id } = req.params;

  this.Model.findByIdAndRemove(id)
    .then((response) => {
      req.responseDocument = response;
      next();
    })
    .catch((e) => {
      next(createError(500, 'The document could not be removed'));
    });
}
function handlePUT(req, res, next) {
  const { id } = req.params;
  const { ...toUpdate } = req.toUpdate || req.body;
  this.Model.findByIdAndUpdate(id, toUpdate, { new: true, runValidators: true })
    .then((response) => {
      req.responseDocument = response;
      next();
    })
    .catch((e) => {
      next(e);
    });
}
/**
 * ERROR: Handle Error
 */
function handleError(err, req, res, next) {
  !err.status
    ? next(err)
    : res.status(err.status).json({ errorMessage: err.message });
  next();
}
// return a new custom Error
function createError(
  code = 500,
  message = 'Oh, oh.... there is a problem bargain with the dababase, try again!',
) {
  let e = new Error();
  e.status = code;
  e.message = message;
  return e;
}

/**
 * MIDDLEWARES: Custom middlewears
 */
function isIdValid(req, res, next) {
  const { id } = req.params;
  if (!id) return next();

  this.Model.findById(id)
    .then((idFound) => {
      return idFound
        ? next()
        : next(
            createError(404, 'The data with the specified ID does not exist.'),
          );
    })
    .catch((e) => {
      next(e);
    });
}
// If there are missing 'required' fields next(error) else next()
function checkForRequiredFields(req, res, next) {
  const params = { ...req.body };

  // Create new Mongose document with the parameters passed in the req.body
  new this.Model(params).validate((error) => {
    // Extract missing required fields.
    let missingRequiredFields;

    error && (missingRequiredFields = Object.keys(error.errors));

    // if there are missing-required-fields ? next(error) : next()
    missingRequiredFields
      ? // Responde with a custom Error messages that contain the missing-required-fields
        next(
          createError(
            400,
            `The following field(s) are required: ${missingRequiredFields.join(
              ', ',
            )}`,
          ),
        )
      : // Continue to next middleware
        next();
  });
}
function excludeUniqueFieldsFromPUT(req, res, next) {
  const toUpdate = { ...req.body };
  const entries = Object.entries(this.Model.schema.paths);
  entries.forEach((entrie) => {
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

/**
 * OTHER Helpers: auxiliar functions
 */
function buildHandlers(endpoint, options, handlers, middlewares) {
  const defaultHandler = {
    GET: ['handleGET', handleGET],
    POST: ['handlePOST', handlePOST],
    PUT: ['handlePUT', handlePUT],
    DELETE: ['handleDELETE', handleDELETE],
  }[endpoint];

  // console.log(defaultHandler);

  if (!middlewares.length) {
    handlers.push(defaultHandler[1].bind(this));
  } else {
    // Check for the type of arguments passed, and push too 'handlers' the needed ones.
    middlewares.forEach((middleware) => {
      switch (middleware) {
        case 'login':
          options.login = true;
          break;
        case defaultHandler[0]:
          handlers.push(defaultHandler[1].bind(this));
          break;
        default:
          handlers.push(middleware);
      }
    });
  }
}
