const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const send = require('../../helpers/send.js')
const settingsFile = '../../user-settings/settings.json'
const settings = require(settingsFile)
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
      if (settings.routine.indexOf(func) !== -1){
        message = "\'" + func + "\'" + " already exists in routine"
      } else {
        settings.routine.push(func);
        message = "added \'" + func +"\'" + "to routine"
      }
  } else if (action == "delete"){
    var index = settings.routine.indexOf(func);
    if (index !== -1){
        settings.routine.splice(index, 1)
        message = "removed \'" + func +"\'" + "from routine"
    } else {
        message = "\'" + func + "\'" + "is not in routine"
    }
  } else if (action == "list"){
    var list = ''
    for (var i = 0; i < settings.routine.length; i++){
        list += (i + 1) + '. ' + settings.routine[i] + '\n'
    }
    return send(
        receiver,
        sender,
        list
    )

  } else {
    for (var i = 0; i < settings.routine.length; i++){
        var name = settings.routine[i]
        var result = await lib[`${context.service.identifier}.messaging.${name}`]({
            sender: sender,
            message: '',
            receiver: receiver,
            createdDatetime: createdDateTime
        })
        promises.push(result);
    }
    return Promise.all(promises).then(function(result){
        return send(
            receiver,
            sender,
            "routine finished"
        )
    })
  }

  if (action == "add"  || action == "delete"){
    return new Promise(function(resolve, reject){
        fs.writeFile('../../user-settings/settings.json', JSON.stringify(routine), function(err){
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
  }
};
