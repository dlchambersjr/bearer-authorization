# Lab-16 ```Basic Authorization```

## Installation

1. Clone the "repo" to your local system.
2. Change to the newly created repo folder.
2. ```npm i``` to load the dependencies found in ```package.json.```
3. Create a ```.env``` file in the root folder and include the following:
  * ```PORT=3000```
  * ```MONGODB_URI=mongodb://localhost:27017/<name of DB>```
  * ```APP_SECRET=<your super secret code>```
  * other environment variables as needed
3. Run ```npm start``` in the command line from the root folder to launch the server

## Dependencies

### First Party
* node.js
* nodemon
* MongoDB

### Third Party
* babel-env 
* babel-eslint
* babel-polyfill
* babel-register 
* cors 
* dotenv 
* express
* jsonwebtoken
* mongoose 

### Local Modules
* index.js - entry point for server
* server.js - primary server code
* user-model.js - user model for Mongo Data Structure
* user-router.js - API Routes for user model.

## Local Middleware
* 404.js - HTTP 404 Route Not Found handler
* auth.js - Basic user authenticator
* error.js - Error handler for non HTTP repsonse code errors.
* hashing.js - Custom hash generator to replace non-functioning bcrypt.






