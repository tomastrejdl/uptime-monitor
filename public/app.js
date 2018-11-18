/**
 * Frontend loginc for the Application
*/

// Container for the frontend application
let app = {}

// Config
app.config = {
  'sessionToken': false
}

// AJAX Client (dor the RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  // Set the defaults
  headers = typeof (headers) == 'object' && headers !== null ? headers : {}
  path = typeof (path) == 'string' ? path : '/'
  console.log(method)
  method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET'
  queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {}
  payload = typeof (payload) == 'object' && payload !== null ? payload : {}
  callback = typeof (callback) == 'function' ? callback : false

  // For each query string parameter sent add it to the path
  let requestUrl = path + '?'
  let counter = 0
  for (let queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++
      // If at least one string parameter has been added, prepend new ones with an ampersand
      if (counter > 1) {
        requestUrl += '&'
      }

      // Add tehe key value
      requestUrl += queryKey + '=' + queryStringObject[queryKey]
    }
  }

  let xhr = new XMLHttpRequest()
  xhr.open(method, requestUrl, true)
  xhr.setRequestHeader('Content-Type', 'application/json')

  // For each aditional header, add it to the header
  for (let headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }

  // If there is a current session token, add it as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id)
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      const statusCode = xhr.status
      const responseReturned = xhr.responseText

      // Callback if requested
      if (callback) {
        try {
          const parsedResponse = JSON.parse(responseReturned)
          callback(statusCode, parsedResponse)
        } catch (e) {
          callback(statusCode, false)
        }
      }
    }
  }

  // Send the payload as JSON
  const payloadString = JSON.stringify(payload)
  xhr.send(payloadString)
}

// Bind the forms
app.bindForms = function () {
  document.querySelector("form").addEventListener("submit", function (e) {

    // Stop it from submitting
    e.preventDefault()
    let formId = this.id
    let path = this.action
    let method = this.method.toUpperCase()

    // Hide the error message (if it's currently shown due to a previous error)
    document.querySelector("#" + formId + " .formError").style.display = 'hidden'

    // Turn the inputs into a payload
    let payload = {}
    let elements = this.elements
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type !== 'submit') {
        let valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value
        payload[elements[i].name] = valueOfElement
      }
    }

    // Call the API
    app.client.request(undefined, path, method, undefined, payload, function (statusCode, responsePayload) {
      // Display an error on the form if needed
      if (statusCode !== 200) {

        // Try to get the error from the api, or set a default error message
        let error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again'

        // Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = error

        // Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display = 'block'

      } else {
        // If successful, send to form response processor
        app.formResponseProcessor(formId, payload, responsePayload)
      }

    })
  })
}

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
  let functionToCall = false
  if (formId == 'accountCreate') {
    // TODO: Do something here now that the account has been created successfully
  }
}

// Init (bootstrapping)
app.init = function () {
  // Bind all form submissions
  app.bindForms()
}

// Call the init processes after the window loads
window.onload = function () {
  app.init()
}
