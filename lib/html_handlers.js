/**
 * HTML handlers
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')
const config = require('./config')

// Define handlers
let handlers = {}

// Index handler
handlers.index = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    let templateData = {
      'head.title': 'uptime-monitor',
      'head.description': 'Free simple uptime monitoring for HTTP/HTTPS sites.',
      'body.class': 'index'
    }

    // Read in the index template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if(!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str) {
            callback(200, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Create Account
handlers.accountCreate = (data, callback) => {
    // Reject any request that isn't a GET
    if (data.method == 'get') {
      // Prepare data for interpolation
      let templateData = {
        'head.title': 'Create an Account',
        'head.description': 'Signup is easy and only takes a few seconds',
        'body.class': 'accountCreate'
      }
  
      // Read in the index template as a string
      helpers.getTemplate('accountCreate', templateData, (err, str) => {
        if(!err && str) {
          // Add the universal header and footer
          helpers.addUniversalTemplates(str, templateData, (err, str) => {
            if(!err && str) {
              callback(200, str, 'html')
            } else {
              callback(500, undefined, 'html')
            }
          })
        } else {
          callback(500, undefined, 'html')
        }
      })
    } else {
      callback(405, undefined, 'html')
    }
}

// Create Session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    let templateData = {
      'head.title': 'Login to your Account',
      'head.description': 'Please enter your phone number and password to access your account',
      'body.class': 'sessionCreate'
    }

    // Read in the index template as a string
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if(!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str) {
            callback(200, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Session Deleted
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    let templateData = {
      'head.title': 'Logged Out',
      'head.description': 'Your have been logged out of your account',
      'body.class': 'sessionDeleted'
    }

    // Read in the index template as a string
    helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
      if(!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str) {
            callback(200, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Account Edit
handlers.accountEdit = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    let templateData = {
      'head.title': 'Account Settings',
      'body.class': 'accountEdit'
    }

    // Read in the index template as a string
    helpers.getTemplate('accountEdit', templateData, (err, str) => {
      if(!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str) {
            callback(200, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Account Deleted
handlers.accountDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    let templateData = {
      'head.title': 'Account Deleted',
      'head.description': 'Your account has been deleted',
      'body.class': 'accountEdit'
    }

    // Read in the index template as a string
    helpers.getTemplate('accountDeleted', templateData, (err, str) => {
      if(!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str) {
            callback(200, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Create a new check
handlers.checksCreate = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Create a New Check',
      'body.class' : 'checksCreate'
    };
    // Read in a template as a string
    helpers.getTemplate('checksCreate',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Dashboard (view all checks)
handlers.checksList = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Dashboard',
      'body.class' : 'checksList'
    };
    // Read in a template as a string
    helpers.getTemplate('checksList',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Edit a Check
handlers.checksEdit = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Check Details',
      'body.class' : 'checksEdit'
    };
    // Read in a template as a string
    helpers.getTemplate('checksEdit',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Favicon
handlers.favicon = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if(!err && data) {
        callback(200, data, 'favicon')
      } else {
        callback(500)
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Public assets
handlers.public = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Get the filename being requested
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim()
    if(trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if(!err && data) {
          // Determine the content type(default to plain test)
          let contentType = 'plain'

          if(trimmedAssetName.indexOf('.css') > -1) contentType = 'css'
          if(trimmedAssetName.indexOf('.png') > -1) contentType = 'png'
          if(trimmedAssetName.indexOf('.jpg') > -1) contentType = 'jpg'
          if(trimmedAssetName.indexOf('.ico') > -1) contentType = 'favicon'

          // Callback the data
          callback(200, data, contentType)
        } else {
          callback(404)
        }
      })
    } else {
      callback(404)
    }
  } else {
    callback(405, undefined, 'html')
  }
}

// Export the module
module.exports = handlers
