const mongoose = require('mongoose');

const routerFactory = function(router, db) {
  // console.log('inside Routerfactory');
  let toPopulate = [];
  let setProjection;

  router
    .route('/')
    .get(handleGET)
    .post(validateParameters, handlePOST, linkCollections);

  router
    .route('/:id')
    .get(isIdValid, handleGET)
    .put(isIdValid, validateParameters, excludeUniqueFieldsFromPUT, handlePUT)
    .delete(isIdValid, handleDELETE);

  router.use(handleError);

  /**
   * ROUTER HANDLERS: handle endpoints
   */
  function handlePOST(req, res, next) {
    const parameters = req.body;

    const toPost = new db(parameters);
    toPost
      .save()
      .then(newDocument => {
        // res.status(201).json(newDocument);
        req.newDocument = newDocument;
        next();
      })
      .catch(e => {
        next(e);
      });
  }
  function handleGET(req, res, next) {
    const { id } = req.params;
    let fetching = !id ? db.find({}, {}) : db.find({ _id: id }, {});

    // Populate the query
    toPopulate.length > 0 && toPopulate.forEach(join => fetching.populate(join[0], join[1]));
    // Project the query
    setProjection && fetching.select(setProjection);

    fetching.exec(function(err, response) {
      if (err) {
        !id
          ? next(createError(500, 'The information could not be retrieved.'))
          : next(500, 'The information could not be retrieved.');
      } else {
        res.status(200).json(response);
      }
    });
  }
  function handleDELETE(req, res, next) {
    const { id } = req.params;

    db.findByIdAndRemove(id)
      .then(response => {
        res.status(200).json(response);
      })
      .catch(e => {
        next(createError(500, 'The friend could not be removed'));
      });
  }
  function handlePUT(req, res, next) {
    const { id } = req.params;
    const { ...toUpdate } = req.toUpdate;
    db.findByIdAndUpdate(id, toUpdate, { new: true, runValidators: true })
      .then(response => {
        res.status(200).json(response);
      })
      .catch(e => {
        next(e);
      });
  }
  /**
   * ERROR: Handle Error
   */
  function handleError(err, req, res, next) {
    !err.status ? next(err) : res.status(err.status).json({ errorMessage: err.message });
    next();
  }
  // return a new custom Error
  function createError(code = 500, message = 'Oh, oh.... there is a problem bargain with the dababase, try again!') {
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

    db.findById(id)
      .then(idFound => {
        return idFound ? next() : next(createError(404, 'The friend with the specified ID does not exist.'));
      })
      .catch(e => {
        next(e);
      });
  }
  // If there are missing 'required' fields return an Error else next()
  function validateParameters(req, res, next) {
    const parameters = { ...req.body };

    // To 'push' the path that are "required: true"
    let requiredPaths = [];

    // Get Schema paths and path's properties:
    const pathsANDschema = Object.entries(db.schema.paths);

    /**
     * Filter the required paths: and push them to the 'requiredPaths' variable
     */
    pathsANDschema.forEach(entrie => {
      const pathName = entrie[0];
      const pathSchema = entrie[1];
      pathSchema.validators.length === 1 && requiredPaths.push(pathName);

      /**
       * If there a several 'validators': => filter if one of them are of type 'required: true'
       */
      if (pathSchema.validators.length > 1) {
        pathSchema.validators.forEach(validator => {
          validator.type == 'required' && requiredPaths.push(pathName);
        });
      }
    });
    // console.log(requiredPaths.length, requiredPaths);

    /**
     * If there are no missing required paths: ? next() : next('custom-error')
     * If the required field is in the body but has no value: error handle by the Schema validators.
     */
    requiredPaths.length === 0 || !areThereMissingPathsInParams(requiredPaths, parameters)
      ? next()
      : next(createError(400, `The following field are required: ${requiredPaths.join(' ')}`));
  }
  function excludeUniqueFieldsFromPUT(req, res, next) {
    const toUpdate = { ...req.body };
    const entries = Object.entries(db.schema.paths);
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
  function linkCollections(req, res, next) {
    const enpoint = req.baseUrl;
    const document = req.newDocument || req.updatedDocument;
    const entries = Object.entries(db.schema.paths);
    let linkedPaths = hasLinkedPaths(document);
    const dbCollections = findInOtherCollections();
    // console.log(dbCollections);
    // If there are no Linked Paths
    if (!linkedPaths[0]) return res.status(200).json({ Document: document });

    res.status(300).json({ Entries: linkedPaths });
  }

  /**
   * Schema middlewares: Custom Pre, Post middlewares for mongoose.
   */

  /**
   * OTHER Helpers: auxiliar functions
   */
  function areThereMissingPathsInParams(paths, parameters) {
    let missingFields = false;
    for (let path of paths) {
      if (!parameters.hasOwnProperty(path)) missingFields = true;
    }
    return missingFields;
  }
  const hasLinkedPaths = document => {
    /**
     *  Schema path's names:
     *  paths_schemas: Array of [path_name , path_schema]
     */
    const paths_schemas = Object.entries(db.schema.paths);
    // Where to push the paths that are 'joins/Links'
    let linkedPath = [];
    // Check for the 'join/linkked' paths -> push then into 'linkedPath'
    paths_schemas.forEach(path_schema => {
      // // console.log('--------------PATH---------------------------');
      // // console.log(path_schema[0], 'PATH', path_schema[1].options.type);
      // // console.log('--------------SCHEMA---------------------------');
      // // console.log('SCHEMA', path_schema[1].options.type[0]);
      // // console.log('SCHEMA', path_schema[1].options.ref);
      // // console.log('SCHEMA', path_schema[1].caster.options.ref && true);
      if (path_schema[1].options.ref || path_schema[1].options.type[0]) {
        linkedPath.push(path_schema[0]);
      }
    });
    /**
     * return: [ Boolean , linkedPath ]
     */
    return [linkedPath.length > 0, linkedPath];
  };
  function findInOtherCollections(collection, query, cb) {
    // mongoose.connection.db.collection(collection, function(err, collection) {
    //   return collection.find(query);
    // });
    let toReturn;
    mongoose.connection.db.listCollections().toArray(function(err, names) {
      if (err) {
        toReturn = err;
      } else {
        toReturn = names;
      }
    });
    return toReturn;
  }

  /**
   * RETURN: Helper functions that push data into this closure from other closures.
   */
  // return function(...arg) {
  //   arg.forEach(arg => toPopulate.push(arg));
  //   // console.log(toPopulate);
  // };
  return {
    setPopulate: function(...arg) {
      arg.forEach(arg => {
        switch (typeof arg) {
          case 'string':
            toPopulate.push([arg, {}]);
            break;
          case 'object':
            const path = Object.keys(arg)[0];
            toPopulate.push([path, arg[path]]);
        }
      });
      // console.log('toPopulate', toPopulate);
    },
    setProjection: function(projections) {
      setProjection = projections;
    },
  };
};

module.exports = { routerFactory };
