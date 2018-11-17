/**
 * Helpers for various tasks
*/

// Dependencies
const crypto = require('crypto')
const config = require('./config')
const https = require('https')
const querystring = require('querystring')

// Container for all the helpers
let helpers = {}

// Create a SHA256 hash
helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    } else {
        return false
    }
}

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str)
        return obj
    } catch(e) {
        return {}
    }
}

// Create a string of random alfanumeric characters of given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
    if(strLength) {
        // Define all possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // Start the final string
        let string = ''

        for(i = 1; i <= strLength; i++) {
            // Get a random character from the possibleCharacters string
            const randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            // Append this character to the final string
            string += randomChar
        }
        return string;
    } else {
        return false
    }
}

// Send and SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 9 ? phone.trim() : false
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false

    if(phone && msg) {
        // Configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+420'+phone,
            'Body': msg
        }

        // Stringify the payload
        const stringPayload = querystring.stringify(payload)

        // Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }

        // Instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            const status = res.statusCode
            // Callback successfully if the request went through
            if(status == 200 || status == 201) {
                callback(false)
            } else {
                callback('Status code retured was ' + status)
            }
        })

        // Bind to the error event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e)
        })

        // Add the payload
        req.write(stringPayload)

        // End the request
        req.end()
    } else {
        callback('Given parameters were missing or invalid')
    }
}

// Export the module
module.exports = helpers