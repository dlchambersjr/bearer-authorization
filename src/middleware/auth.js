'use strict';

import User from '../api/user-model.js';

export default (capability) => {

  return (req, res, next) => {

    try {

      let [authType, authString] = req.headers.authorization.split(/\s+/);

      // FIXME: added eslint-disable-line below because the linter was complaining about the indentation for the switch case

      switch (authType.toLowerCase()) {
        case 'basic': return _authBasic(authString); // eslint-disable-line
        case 'bearer': return _authBearer(authString);// eslint-disable-line
        default: return _authError(); // eslint-disable-line
      }

    } catch (error) {
      return _authError();
    }

    // Basic Auth Result {username:<name>, password:<pass>}
    function _authBasic(authString) {
      let base64Buffer = Buffer.from(authString, 'base64');
      let bufferString = base64Buffer.toString();
      let [username, password] = bufferString.split(':');
      let auth = {
        username,
        password,
      };

      return User.authenticateBasic(auth)
        .then(user => _authenticate(user));
    }

    function _authBearer(authString) {
      return User.authenticateToken(authString)
        .then(user => _authenticate(user));
    }

    function _authenticate(user) {
      if (user && (!capability || (user.can(capability)))) {
        req.user = user;
        req.token = user.generateToken();
        next();
      } else {
        _authError();
      }
    }

    function _authError() {
      next({
        status: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid User ID/Password',
      });
    }

  };

};