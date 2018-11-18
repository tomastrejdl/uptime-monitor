/**
 * Primary file for the uptime-monitor API
 * Author: Tomas Trejdl<tom.trejdl@seznam.cz>
*/

// Dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')

// Declare the app
let app = {}

// Init
app.init = () => {
  // Start the server
  server.init()

  // Start the workers
  workers.init()

  // Start the CLI, but make sure it starts last
  setTimeout(() => {
    cli.init()
  }, 50)
}

// Execute init
app.init()

// Export the app
module.exports = app;
