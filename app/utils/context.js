const cls = require('cls-hooked')
const uuidv4 = require('uuid/v4')

const clsNamespace = cls.createNamespace('app')

exports.clsMiddleware = (req, res, next) => {

  try {
    // req and res are event emitters. We want to access CLS context inside of their event callbacks
    clsNamespace.bind(req)
    clsNamespace.bind(res)

    const requestID = uuidv4()

    clsNamespace.run(() => {
      clsNamespace.set('req:x-requestID', requestID);
      clsNamespace.set('req:x-app-language', req.headers['x-app-language']);
      clsNamespace.set('req:x-channel', req.get('x-request-channel'));
      clsNamespace.set('req:x-user-plan-type', req.get('x-user-plan-type'));
      clsNamespace.set('req:x-user-package-plan',req.get('x-user-package-plan'));
      clsNamespace.set('req:x-user-segment-type',req.get('x-user-segment-type'));
      clsNamespace.set('req:x-app-version', req.get('x-app-version'));
      clsNamespace.set('req:msisdn', req.params.msisdn || req.body.msisdn || 'NA')
      next()
    })
  } catch (error) {
    console.log(error);
  }


}

exports.vars = clsNamespace;