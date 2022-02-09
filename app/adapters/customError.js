'use strict'

//creates a custom error constructed with error code 

class customError extends Error {
  constructor (code, message) {
    super(message)
    this.code = code;
  }
}

module.exports = customError