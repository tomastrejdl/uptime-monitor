/**
 * These are server related tasks
*/

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')
const handlers = require('./handlers')
const helpers = require('./helpers')
const path = require('path')

// Instantiate a server module object
let server = {}

// Create HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res)
})

// Create HTTPS server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.unifiedServer(req, res)
})

// All the server login for both the HTTP and HTTPS servers
server.unifiedServer = (req, res) => {
  // Get the URL and parse it
  let parsedUrl = url.parse(req.url, true)

  // Get path from the URL
  let path = parsedUrl.pathname
  let trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  let queryString = parsedUrl.query

  // Get the HTTP method
  let method = req.method.toLowerCase()

  // Get the headers as an object
  let headers = req.headers

  // Get the payload, if any
  let decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (data) => {
    buffer += decoder.write(data)
  })
  req.on('end', () => {
    buffer += decoder.end()

    // Choose the handler this request should go to, if one is not found use the notfound handler
    let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notfound

    //Construct the data object and send it to the handler
    let data = {
      'trimmedPath': trimmedPath,
      'queryString': queryString,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Route the handler to the handler specified in our router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called by the handler or default to 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200

      // Use the payload called by the handler or default to an empty object
      payload = typeof (payload) == 'object' ? payload : {}

      // Convert payload toi a string
      let payloadString = JSON.stringify(payload)

      // Return the respond
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // Log stuff
      console.log('Returning this response: ', statusCode, payloadString)
    })

  })
}

// Define a request router
server.router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
}

// Init server
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log('The server is listening on port ' + config.httpPort)
  })

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('The server is listening on port ' + config.httpsPort)
  })
}

// Export the whole server
module.exports = server
