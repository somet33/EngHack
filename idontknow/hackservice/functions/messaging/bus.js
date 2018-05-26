const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const https = require('https')
const send = require('../../helpers/send.js')
const settingsFile = '../../user-settings/settings.json'
const settings = require(settingsFile)

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
    //console.log(sender)
    var apicall = 'https://maps.googleapis.com/maps/api/directions/json?origin=<userOrigin>&destination=<userDestination>&alternatives=true&mode=transit&transit=bus&key=AIzaSyABIq79BuPfXIQcoWTfj9I1D3fU3X8DCf4'
    var output = '';

    if(message != ''){
      var split = message.split("-");
      if(split.length>1){
        apicall = apicall.replace('<userOrigin>', split[0]).replace('<userDestination>', split[1]);
      }else{
        return send(
            receiver,
            sender,
            "Please Enter Bus in the form \"*bus :<origin>-<destination>\""
        )
      }
    }else{
      var split = settings.defaultBus.toString().split("-");
      apicall = apicall.replace('<userOrigin>', split[0]).replace('<userDestination>', split[1]);
    }

    return new Promise(function(resolve, reject){

        https.get(apicall, function (res){

            res.setEncoding('utf8');
            let rawData = '';

            res.on('data', function(data){
                rawData += data;
            })
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);
                resolve(parsedData);
              } catch (e) {
                console.error(e.message);
              }
            });

        });

    }).then(function(result){

        try{
          output = "From: " + result.routes[0].legs[0].start_address + "\nTo: "+ result.routes[0].legs[0].end_address ;
          for(var j = 0; j<result.routes.length; ++j){
            output += "\n\n"
            var leg = result.routes[j].legs[0]
            for(var i = 0; i<leg.steps.length; ++i){
              if(leg.steps[i].travel_mode=="TRANSIT"){
                output += "\nDeparture: " + leg.steps[i].transit_details.departure_time.text + " from " + leg.steps[i].transit_details.departure_stop.name;
                output += "\nArrival: " +leg.steps[i].transit_details.arrival_time.text + " at " + leg.steps[i].transit_details.arrival_stop.name;
                output += "\nLine: " +leg.steps[i].transit_details.line.short_name;
              }
            }
          }
        }catch(e){
          output = "Invalid command: try re-wording the 'origin' and 'destination' name/address"
        }
        return send(
            receiver,
            sender,
            output
        )
    })
}
