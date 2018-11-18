9/**
 * JSON Api handlers
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')
const config = require('./config')

// Define handlers
let handlers = {}

// Users handler
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for users submethods
handlers._users = {}

// Users POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 9 ? data.payload.phone.trim() : false
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password)

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          }

          // Store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { 'error': 'Could not create the new user' })
            }
          })
        } else {
          callback(500, { 'error': 'Could not hash the user\'s password' })
        }


      } else {
        // User already exists
        callback(400, { 'error': 'A user with that phone number already exists' })
      }
    })
  } else {
    callback(400, { 'error': 'Missing required fields' })
  }
}

// Users GET
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that the phone number provided is valid
  const phone = typeof (data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 9 ? data.queryString.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Looup the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the user object before returning it to the requester
            delete data.hashedPassword
            callback(200, data)
          } else {
            callback(404)
          }
        })
      } else {
        callback(403, { 'error': 'Missing required token in header or token is invalid' })
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field' })
  }
}

// Users PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  // Check for the required field
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 9 ? data.payload.phone.trim() : false

  // Check for the optional fields
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  // Error if the phone is invalid
  if (phone) {

    // Error if nothing is sent to update
    if (firstName || lastName || password) {

      // Get the token from the headers
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {

          // Lookup the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update the fields that are necessary
              if (firstName)
                userData.firstName = firstName
              if (lastName)
                userData.lastName = lastName
              if (password)
                userData.hashedPassword = helpers.hash(password)

              // Store the new updated
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200)
                } else {
                  console.log(err)
                  callback(500, { 'error': 'Could not update the user' })
                }
              })
            } else {
              callback(400, { 'error': 'The specified user does not exist' })
            }
          })
        } else {
          callback(403, { 'error': 'Missing required token in header or token is invalid' })
        }
      })
    } else {
      callback(400, { 'error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'error': 'Missing required field' })
  }

}

// Users DELETE
// Required field: phone
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 9 ? data.queryString.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Looup the user
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                // Delete each of the checks associated with the user
                const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
                const checksToDelete = userChecks.length
                if(checksToDelete > 0) {
                  let checksDeleted = 0
                  let deletionErrors = false
                  // Loop through checks
                  userChecks.forEach(checkId => {
                    // Delete the check
                    _data.delete('checks', checkId, (err) => {
                      if(err) {
                        deletionErrors = true
                      }
                      checksDeleted++
                      if(checksDeleted == checksToDelete) {
                        if(!deletionErrors) {
                          callback(200)
                        } else {
                          callback(500, {'error': 'Errors encountered while atempting to delete all of the user\'s checks. All checks amy not have been deleted from the system successfully'})
                        }
                      }
                    })
                  });
                } else {
                  callbacK(200)
                }
              } else {
                callback(500, { 'error': 'Could not delete the specified user' })
              }
            })
          } else {
            callback(400, { 'error': 'Could not find the specified user' })
          }
        })
      } else {
        callback(403, { 'error': 'Missing required token in header or token is invalid' })
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field' })
  }
}

// Tokens handler
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for users submethods
handlers._tokens = {}

// Tokens POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 9 ? data.payload.phone.trim() : false
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  if (phone && password) {
    // Lookup the user that matches the phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password)
        if (hashedPassword === userData.hashedPassword) {
          // If valid , create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20)
          const expires = Date.now() + 1000 * 60 * 60
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          }

          // Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, { 'error': 'Could not create token' })
            }
          })
        } else {
          callback(400, { 'error': 'Password did not match the specified user\'s stored password ' })
        }
      } else {
        callback(400, { 'error': 'Could not find the specified user' })
      }
    })
  } else {
    callback(400, { 'error': 'Missing required fields' })
  }
}

// Tokens GET
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the id number provided is valid
  const id = typeof (data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false
  if (id) {
    // Looup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field' })
  }
}

// Tokens PUT
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false
  const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.extend : false

  if (id && extend) {
    // Looup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration 1 hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60

          // Store the new updates
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200)
            } else {
              callback(500, { 'error': 'Could not extend token' })
            }
          })
        } else {
          callback(400, { 'error': 'The token has already expired and cannot be extended' })
        }
      } else {
        callback(400, { 'error': 'Specified token does not exist' })
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field(s) or field(s) are invalid' })
  }
}

// Tokens DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check that the id is valid
  const id = typeof (data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false
  if (id) {
    // Looup the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { 'error': 'Could not delete the specified token' })
          }
        })
      } else {
        callback(400, { 'error': 'Could not find the specified token' })
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field(s)' })
  }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

// Checks handler
handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for users submethods
handlers._checks = {}

// Checks POST
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback) => {
  // Validate inputs
  const protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
  const url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false
  const method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
  const successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
  const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

  if(protocol && url && method && successCodes && timeoutSeconds) {
     // Get the token from the headers
     const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
     _data.read('tokens', token, (err, tokenData) => {
      if(!err && tokenData) {
        const userPhone = tokenData.phone

        // Lookup the user data
        _data.read('users', userPhone, (err, userData) => {
          if(!err && userData) {
            const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
            // Verify that the user has less than the number of max-checks-per-user
            if(userChecks.length < config.maxChecksPerUser) {
              // Create a random id for the check
              const checkId = helpers.createRandomString(20)

              // Create the check object and include the user's phone
              const checkObject = {
                'id': checkId,
                'userPhone': userPhone,
                'protocol': protocol,
                'url': url,
                'method': method,
                'successCodes': successCodes,
                'timeoutSeconds': timeoutSeconds
              }

              // Save the object
              _data.create('checks', checkId, checkObject, (err) => {
                if(!err) {
                  // Add the checkId to the user's object
                  userData.checks = userChecks
                  userData.checks.push(checkId)

                  // Save the new user data
                  _data.update('users', userPhone, userData, (err) => {
                    if(!err) {
                      // Return the data about the new check
                      callback(200, checkObject)
                    } else {
                      callback(500, {'error': 'Could not update the user with the new check'})
                    }
                  })
                } else {
                  callback(500, {'error': 'Could not create the new check'})
                }
              })
            } else {
              callback(400, {'error': 'The user already has the maximum number of checks (' + config.maxChecksPerUser + ')'})
            }
          } else {
            callback(403)
          }
        })
      } else {
        callback(403)
      }
     })
  } else {
    callback(400, {'error': 'Missing required inputs, or inputs are invalid'})
  }
}

// Checks GET
// Required data: id
// Optional data: none
handlers._checks.get = (data, callback) => {
  // Check that the check id provided is valid
  const id = typeof (data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false
  if (id) {
    // Lookup the check
    _data.read('checks', id, (err, checkData) => {
      if(!err && checkData) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // Return the check data
            callback(200, checkData)
          } else {
            callback(403)
          }
        })
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field' })
  }
}

// Checks PUT
// Required data: id
// Optional data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = (data, callback) => {
  // Validate inputs
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false
  const protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
  const url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false
  const method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
  const successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
  const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

  // Check to make sure id is valid
  if(id) {
    if(protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read('checks', id, (err, checkData) => {
        if(!err && checkData) {
          // Get the token from the headers
          const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
          // Verify that the given token is valid and belongs to the user who created the check
          handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              // Update the check where necessary
              if(protocol) checkData.protocol = protocol
              if(url) checkData.url = url
              if(method) checkData.method = method
              if(successCodes) checkData.successCodes = successCodes
              if(timeoutSeconds) checkData.timeoutSeconds = timeoutSeconds

              // Store the updates
              _data.update('checks', id, checkData, (err) => {
                if(!err) {
                  callback(200)
                } else {
                  callback(500, {'error': 'Could not update the check'})
                }
              })
            } else {
              callback(403)
            }
          })
        } else {
          callback(400, {'error': 'Check ID did not exist'})
        }
      })
    } else {
      callback(400, {'error': 'Missing fields to update'})
    }
  } else {
    callback(400, {'error': 'Missing required field'})
  }

}

// Checks DELETE
// Required data: id
// Optional data: none
handlers._checks.delete = (data, callback) => {
  // Check that the phone number is valid
  const id = typeof (data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false
  if (id) {

    // Lookup the check
    _data.read('checks', id, (err, checkData) => {
      if(!err && checkData) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // Delete the check data
            _data.delete('checks', id, (err) => {
              if(!err) {
                // Looup the user
                _data.read('users', checkData.userPhone, (err, userData) => {
                  if (!err && userData) {
                    const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []

                    // Remove the deleted check from the list of checks
                    const checkPosition = userChecks.indexOf(id)
                    if(checkPosition > -1) {
                      userChecks.splice(checkPosition, 1)
                      // Re-save the user's data
                      _data.update('users', checkData.userPhone, userData, (err) => {
                        if(!err) {
                          callback(200)
                        } else {
                          callback(500, {'error': 'Could not update the user'})
                        }
                      })
                    } else {
                      callback(500, {'error': 'Could not find the check on the user\'s object, so could not remove it'})
                    }
                  } else {
                    callback(400, { 'error': 'Could not find the user, who created the cheks, so could not remove the check from the list of check on the user object' })
                  }
                })
              } else {
                callback(500, {'error': 'Could not delete the check data'})
              }
            })
          } else {
            callback(403)
          }
        })
      } else {
        callback(400, {'error': 'Specified check id does not exist'})
      }
    })
  } else {
    callback(400, { 'error': 'Missing required field' })
  }
}



// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
}

// Hello handler
handlers.hello = (data, callback) => {
  callback(200, { 'message': 'Hello world' })
}

// Not found handler
handlers.notfound = (data, callback) => {
  callback(404)
}

// Export the module
module.exports = handlers
