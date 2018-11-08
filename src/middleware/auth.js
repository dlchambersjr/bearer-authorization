'use strict';

import User from '../userApi/user-model.js';

export default (req, res, next) => {

  let authenticate = (auth) => {

    // Validate the user using the model's authenticate method
    User.authenticate(auth)
      .then(user => {
        if (!user) {
          getAuth();
        } else {
          req.token = user.generateToken();
          next();
        }
      })
      .catch(next);

  };

  // If we're not authenticated either show an error or pop a window
  let getAuth = () => {

    /* TODO: Explore later
    Explore this code after completing lab
     Sending this out, will show the annoying pop-up window in the browser
     While useless IRL, it's fun to play with this and see how you can login with a browser
    res.set({
      'WWW-Authenticate': 'Basic realm="Super Secret Area"'
    }).send(401);

    For our actual purposes, though, send back a JSON formatted error object through our middleware
    */

    next({ status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password' });
  };

  // Try to authenticate -- parse out the headers and do some work!
  try {
    let auth = {};
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      return getAuth();
    }

    // BASIC Auth
    if (authHeader.match(/basic/i)) {
      // SAMPLE BASIC: Basic ZnJlZDpzYW1wbGU=
      // Break that apart ...
      let base64Header = authHeader.replace(/Basic\s+/i, ''); // ZnJlZDpzYW1wbGU=
      let base64Buffer = Buffer.from(base64Header, 'base64'); // <Buffer 01 02...>
      let bufferString = base64Buffer.toString(); // john:mysecret
      let [username, password] = bufferString.split(':');  // variables username="john" and password="mysecret"
      auth = { username, password };  // {username:"john", password:"mysecret"}

      // Start the authentication train
      authenticate(auth);
    }
  } catch (e) {
    next(e);
  }

};
