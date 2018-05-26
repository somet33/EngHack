const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const send = require('../../helpers/send.js')

/**
* motion sensor
* @param {string} sender
* @param {string} receiver
* @param {string} message
* @param {string} createdDateTime
* @returns {any}
*/
module.exports = async (sender = '', receiver = '', message = '', createdDateTime = '', context) => {
  return send(
    receiver,
    '16478662196',
    message
  )
};
