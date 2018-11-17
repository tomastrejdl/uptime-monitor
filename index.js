/**
 * Primary file for the uptime-monitor API
 * Author: Tomas Trejdl<tom.trejdl@seznam.cz>
*/

// Dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')

// Declare the app
let app = {}

// Init
app.init = () => {
  // Start the server
  server.init()

  // Start the workers
  workers.init()
}

// Execute init
app.init()

// Export the app
module.exports = app;