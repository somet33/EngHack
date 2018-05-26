const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const send = require('../../helpers/send.js')
const routineFile = '../../user-settings/routine.json'
const routine = require(routineFile)
const fs = require('fs')

/**
* motion sensor
* @param {string} sender
* @param {string} receiver
* @param {string} message
* @param {string} createdDateTime
* @returns {any}
*/
module.exports = async (sender = '', receiver = '', message = '', createdDateTime = '', context) => {
  var split = message.split('-')
  var action = split[0]
  var func = split[1]
  var message = ''
  var promises = []
  
  if(action == "add"){
      if (routine.functions.indexOf(func) !== -1){
        message = "\'" + func + "\'" + " already exists in routine"
      } else {
        routine.functions.push(func);
        message = "added \'" + func +"\'" + "to routine"
      }
  } else if (action == "delete"){
    var index = routine.functions.indexOf(func);
    if (index !== -1){
        routine.functions.splice(index, 1)
        message = "removed \'" + func +"\'" + "from routine"
    } else {
        message = "\'" + func + "\'" + "is not in routine"
    }
  } else {
    for (var i = 0; i < routine.functions.length; i++){
        var name = routine.functions[i]
        var result = await lib[`${context.service.identifier}.messaging.${name}`]({
            sender: sender,
            message: '',
            receiver: receiver,
            createdDatetime: createdDateTime
        })
        promises.push(result);
    }
  }

  if (action == "add"  || action == "delete"){
    return new Promise(function(resolve, reject){
            fs.writeFile('./user-settings/routine.json', JSON.stringify(routine), function(err){
                if (err){
                    reject(err);
                }
                resolve();
            });
    }).then(function(result){
        return send(
            receiver,
            sender,
            message
        )
    });
  } else {
    return Promise.all(promises).then(function(result){
        return send(
            receiver,
            sender,
            "routine finished"
        )
    })

  }
};
