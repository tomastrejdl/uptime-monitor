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
    'accountSid': 'ACfa47b6fd6d9672271a4b38795f01d61d',
    'authToken': 'e1e696acfdf328aaade5be04c1f11716',
    'fromPhone': '+420607489506'
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
  }
}

// Determine which environment was passed as a command-line argument
const currentEnv = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the curretn environment is one of the environments above, if not, default to stating
let environmentToExport = typeof (environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging

// Export the module
module.exports = environmentToExport