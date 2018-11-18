/**
 * CLI realted tasks
*/

// Dependencies
const readLine = require('readline')
const util = require('util')
const debug = util.debuglog('cli')
const events = require('events')
class _events extends events{}
const e = new _events

// Instantialte the CLI module object
let cli = {}

// Input handlers
e.on('man', (str) => {cli.responders.help()})
e.on('help', (str) => {cli.responders.help()})
e.on('exit', (str) => {cli.responders.exit()})
e.on('stats', (str) => {cli.responders.stats()})
e.on('list users', (str) => {cli.responders.listUsers()})
e.on('more user info', (str) => {cli.responders.moreUserInfo(str)})
e.on('list checks', (str) => {cli.responders.listChecks(str)})
e.on('more check info', (str) => {cli.responders.moreCheckInfo(str)})
e.on('list logs', (str) => {cli.responders.listLogs()})
e.on('more log info', (str) => {cli.responders.moreLogInfo(str)})

// Responders object
cli.responders = {}

// Help / Man
cli.responders.help = function() {
    console.log('You asked for help')
}

// Exit
cli.responders.exit = function() {
    console.log('You asked for exit')
}

// Stats
cli.responders.stats = function() {
    console.log('You asked for stats')
}

// List users
cli.responders.listUsers = function() {
    console.log('You asked to list users')
}

// More user info
cli.responders.moreUserInfo = function(str) {
    console.log('You asked for more user info', str)
}

// List checks
cli.responders.listChecks = function(str) {
    console.log('You asked for checks', str)
}

// More check info
cli.responders.moreCheckInfo = function(str) {
    console.log('You asked for more check info', str)
}

// List logs
cli.responders.listLogs = function() {
    console.log('You asked for logs')
}

cli.responders.moreLogInfo = function(str) {
    console.log('You asked for more log info', str)
}

// Input processor
cli.processInput = (str) => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
    if(str) {
        // Codify the unique strings that identify questions allowed to be asked
        const uniqueInputs = ['man', 'help', 'exit', 'stats', 'list users', 'more user info', 'list checks', 'more check info', 'list logs', 'more log info']

        // Go through the possible inputs, emit an event when a match is found
        let matchFound = false
        let counter = 0
        uniqueInputs.some((input) => {
            if(str.toLowerCase().indexOf(input) > -1) {
                matchFound = true
                // Emit an event matching the unique input, and inlude the full string given
                e.emit(input, str)
                return true
            }
        })

        // If no match is found, tell the user to try again
        if(!matchFound) {
            console.log(`${str}: command not found`)
        }
    }
}

// Init script
cli.init = () => {
    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

    // Start the interface
    let _interface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    })
    
    // Create an initial prompt
    _interface.prompt()

    // Handle each line of input seperately
    _interface.on('line', (str) => {
        // Send to the input processor
        cli.processInput(str)

        // Re-initialize the prompt
        _interface.prompt()
    })

    // If the user stops the CLI, kill the associated process
    _interface.on('close', () => {
        process.exit(0)
    })

}

// Export eh module
module.exports = cli