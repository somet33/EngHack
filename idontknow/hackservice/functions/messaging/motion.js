const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const send = require('../../helpers/send.js')

/**
* motion sensor
* @param {any} sender
* @param {any} receiver
* @param {any} message
* @returns {any}
*/
module.exports = async (sender = '', receiver = '', message = '', createdDateTime = '', context) => {
  return (
    receiver,
    '16478662196',
    message
  )
};
