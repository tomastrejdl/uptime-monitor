/**
 * Library for storing and rotating logs
*/

// Dependencies
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// Container for the module
let logs = {}

// Base directory of the data folder
logs.baseDir = path.join(__dirname, '/../.logs/')

// Append a string to a file. Create the file if it does not exist.
logs.append = (file, str, callback) => {
  // Open the file for appending
  fs.open(logs.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      fs.appendFile(fileDescriptor, str + '\n', (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false)
            } else {
              callback('Error closing file that was being appended')
            }
          })
        } else {
          callback('Error appending to file')
        }
      })
    } else {
      callback('Could not open file for appending')
    }
  })
}

// List all the logs, and optionally include the compressed logs
logs.list = (includeCompressedLogs, callback) => {
  fs.readdir(logs.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      let trimmedFileNames = []
      data.forEach((fileName) => {
        // Add the .log files
        if (fileName.indexOf('.log') > -1) {
          trimmedFileNames.push(fileName.replace('.log', ''))
        }

        // Add on the .gz files
        if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace('.gz.b64', ''))
        }
      })
      callback(false, trimmedFileNames)
    } else {
      callback(err, data)
    }
  })
}

// Compress the content of one .log file into a .gz.b64 file within the same directory
logs.compress = (logId, newFileId, callback) => {
  const sourceFile = logId + '.log'
  const destFile = newFileId + '.gz.b64'

  // Read the source file
  fs.readFile(logs.baseDir + sourceFile, 'utf8', (err, inputString) => {
    if(!err && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (err, buffer) => {
        if(!err && buffer) {
          // Send the data to the destination file
          fs.open(logs.baseDir + destFile, 'wx', (err, fileDescriptor) => {
            if(!err && fileDescriptor) {
              // Write to the destination file
              fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                if(!err) {
                  // Close the destination file
                  fs.close(fileDescriptor, (err) => {
                    if(!err) {
                      callback(false)
                    } else {
                      callbacK(err)
                    }
                  })
                } else {
                  callback(err)
                }
              })
            } else {
              callback(err)
            }
          })
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

// Decompress the contents of a .gz.b64 file to a string variable
logs.decompress = (fileId, callback) => {
  const fileName = fileId + '.gz.b64'
  fs.readFile(logs.baseDir + fileName, 'utf8', (err, str) => {
    if(!err && str) {
      // Decompress the data
      let inputBuffer = Buffer.from(str, 'base64')
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if(!err && outputBuffer) {
          // Callback
          const str = outputBuffer.toString()
          callback(false, str)
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

// Truncate a log file
logs.truncate = (logId, callback) => {
  fs.truncate(logs.baseDir + logId + '.log', 0, (err) => {
    if(!err) {
      callback(false)
    } else {
      callback(err)
    }
  })
}

// Export the module
module.exports = logs
