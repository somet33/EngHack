const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const http = require('http')
const send = require('../../helpers/send.js')

/**
* weather handler, responds if user texts "weather"
*  (or any uppercase variation like "WEATHER")
* @param {string} sender The phone number that sent the text to be handled
* @param {string} receiver The StdLib phone number that received the SMS
* @param {string} message The contents of the SMS
* @param {string} createdDatetime Datetime when the SMS was sent
* @returns {any}
*/
module.exports = async (sender = '', receiver = '', message = '', createdDatetime = '', context) => {
    console.log(sender)
    var weather = ''
    return new Promise(function(resolve, reject){
        http.get('http://api.openweathermap.org/data/2.5/weather?q=waterloo,ca&units=metric&appid=1f5f9d6588c1a44d106213e974332dda', function (res){
        
            res.on('data', function(data){

                weather = data;
            })
            res.on('end', function(){
                resolve(JSON.parse(weather));
            });


        });

    }).then(function(result){
        var message = "weather: " + result.main.temp.toFixed(2) + "C"
        return send(
            receiver,
            sender,
            message
        )
    })
}
