const lib = require('lib')({ token: process.env.STDLIB_TOKEN })

/**
* Generic MessageBird SMS handler
* @param {string} sender The phone number that sent the text to be handled
* @param {string} receiver The StdLib phone number that received the SMS
* @param {string} message The contents of the SMS
* @param {string} createdDatetime Datetime when the SMS was sent
* @returns {any}
*/
module.exports = async (sender = '', receiver = '', message = '_', createdDatetime = '', context) => {
  // Try to find a handler for the message, default to __notfound__
  var split = message.match(/[^:]*[*]([^:]+):?(.*)/);
  var handler = '_';
  var dataText = '';

  if (split){
    handler = split[1].trim().toLowerCase()
    dataText = split[2].trim()
  }

  let result
  try {
    result = await lib[`${context.service.identifier}.messaging.${handler}`]({
      sender: sender,
      message: handler +','+dataText,
      receiver: receiver,
      createdDatetime: createdDatetime
    })
  } catch (e) {
    // Catch thrown errors specifically so we can log them. See logs using
    // $ lib logs <username>.<service name> from the command line
    console.error(e)
    return
  }
  return result
}
