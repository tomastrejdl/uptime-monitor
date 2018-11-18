/**
 * Create and export configuration variables
*/

// Container for all the environments
let environments = {}

// Staging (dfault) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'maxChecksPerUser': 5,
  'twilio': {
    'accountSid': '',
    'authToken': '',
    'fromPhone': ''
  },
  'templateGlobals': {
    'appName': 'uptime-monitor',
    'companyName': 'Tomas trejdl',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000/' 
  }
}

// Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret',
  'maxChecksPerUser': 5,
  'twilio': {
    'accountSid': '',
    'authToken': '',
    'fromPhone': ''
  },
  'templateGlobals': {
    'appName': 'uptime-monitor',
    'companyName': 'Tomas trejdl',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:5000/' 
  }
}

// Determine which environment was passed as a command-line argument
const currentEnv = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the curretn environment is one of the environments above, if not, default to stating
let environmentToExport = typeof (environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging

// Export the module
module.exports = environmentToExport
