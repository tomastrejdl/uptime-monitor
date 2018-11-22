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
const apiHandlers = require('./api_handlers')
const htmlHandlers = require('./html_handlers')
const helpers = require('./helpers')
const path = require('path')
const util = require('util')
const debug = util.debuglog('server')

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

    // Choose the handler this request should go to, if one is not found use the notfound handler @TODO: add notfound handler for HTML
    let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : apiHandlers.notfound

    // If the request is within the public directory, use the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? htmlHandlers.public : chosenHandler

    //Construct the data object and send it to the handler
    let data = {
      'trimmedPath': trimmedPath,
      'queryString': queryString,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    try {
      // Route the handler to the handler specified in our router
      chosenHandler(data, (statusCode, payload, contentType) => {
        server.processHandlerResponse(res, method, trimmedPath, statusCode,payload, contentType)
      })
    } catch(e) {
      debug('\x1b[91m')
      debug(e)
      debug('\x1b[0m')
      server.processHandlerResponse(res, method, trimmedPath, 500, {'error': 'An unknown error occured.'}, 'json')
    }

  })
}

server.processHandlerResponse = function(res, method, trimmedPath, statusCode,payload, contentType) {
  // Determine the type of response, fallback to JSON
  contentType = typeof(contentType) == 'string' ? contentType : 'json'

  // Use the status code called by the handler or default to 200
  statusCode = typeof (statusCode) == 'number' ? statusCode : 200

  // Return the response-parts taht are content-specific
  let payloadString = ''
  if(contentType == 'json') {
    res.setHeader('Content-Type', 'application/json')
    // Use the payload called by the handler or default to an empty object
    payload = typeof (payload) == 'object' ? payload : {}
    // Convert payload to a string
    payloadString = JSON.stringify(payload)
  }

  if(contentType == 'html') {
    res.setHeader('Content-Type', 'text/html')
    payloadString = typeof (payload) == 'string' ? payload : ''
  }
  if(contentType == 'favicon') {
    res.setHeader('Content-Type', 'image/x-icon')
    payloadString = typeof (payload) !== 'undefined' ? payload : ''
  }
  if(contentType == 'css') {
    res.setHeader('Content-Type', 'text/css')
    payloadString = typeof (payload) !== 'undefined' ? payload : ''
  }
  if(contentType == 'png') {
    res.setHeader('Content-Type', 'image/png')
    payloadString = typeof (payload) !== 'undefined' ? payload : ''
  }
  if(contentType == 'jpg') {
    res.setHeader('Content-Type', 'image/jpeg')
    payloadString = typeof (payload) !== 'undefined' ? payload : ''
  }
  if(contentType == 'plain') {
    res.setHeader('Content-Type', 'text/plain')
    payloadString = typeof (payload) !== 'undefined' ? payload : ''
  }

  // Return the  response-parts taht are common for all content types
  
  res.writeHead(statusCode)
  res.end(payloadString)

  // If the response is 200, print greed otherwise print red
  if(statusCode == 200) {
    debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode)
  } else {
    debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode)
  }
}

// Define a request router
server.router = {
  '': htmlHandlers.index,
  'account/create': htmlHandlers.accountCreate,
  'account/edit': htmlHandlers.accountEdit,
  'account/deleted': htmlHandlers.accountDeleted,
  'session/create': htmlHandlers.sessionCreate,
  'session/deleted': htmlHandlers.sessionDeleted,
  'checks/all': htmlHandlers.checksList,
  'checks/create': htmlHandlers.checksCreate,
  'checks/edit': htmlHandlers.checksEdit,
  'ping': apiHandlers.ping,
  'api/users': apiHandlers.users,
  'api/tokens': apiHandlers.tokens,
  'api/checks': apiHandlers.checks,
  'favicon.ico': htmlHandlers.favicon,
  'public': htmlHandlers.public
}

// Init server
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m', 'The HTTP server is listening on port ' + config.httpPort)
  })

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m', 'The HTTPS server is listening on port ' + config.httpsPort)
  })
}

// Export the whole server
module.exports = server
