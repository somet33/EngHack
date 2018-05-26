const lib = require('lib')({ token: process.env.STDLIB_TOKEN })
const https = require('https')
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
    var apicall = 'https://maps.googleapis.com/maps/api/directions/json?origin=<userOrigin>&destination=<userDestination>&alternatives=true&mode=transit&transit=bus&key=AIzaSyABIq79BuPfXIQcoWTfj9I1D3fU3X8DCf4'

    return new Promise(function(resolve, reject){
        if(message != ''){
          var split = message.split("-");
          console.log(split[0]+" and "+split[1]);
          apicall = apicall.replace('<userOrigin>', split[0]).replace('<userDestination>', split[1]);
          console.log(apicall);
        }else{
          apicall = apicall = 'https://maps.googleapis.com/maps/api/directions/json?origin=181LesterStreet,Waterloo&destination=OpentextCorporation,Waterloo>&alternatives=true&mode=transit&transit=bus&key=AIzaSyABIq79BuPfXIQcoWTfj9I1D3fU3X8DCf4'
        }
        https.get(apicall, function (res){

            res.setEncoding('utf8');
            let rawData = '';
            //res.on('data', (chunk) => { rawData += chunk; });
            res.on('data', function(data){
                rawData += data;
            })
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);
                //console.log(parsedData.routes[0].legs[0].start_address);
                resolve(parsedData);
              } catch (e) {
                console.error(e.message);
              }
            });

        });

    }).then(function(result){
       //console.log(string);
       // console.log(weather);
       //console.log('Full temp ' + require('util').inspect(result, { depth: null }));
        //var message = "Bus: " + result.geocoded_waypoints[1].geocoder_status;
        //console.log("ROUTES: "+result.routes.length)
        var message = "From: " + result.routes[0].legs[0].start_address + "\nTo: "+ result.routes[0].legs[0].end_address ;
        for(var j = 0; j<result.routes.length; ++j){
          message += "\n\n"
          var leg = result.routes[j].legs[0]
          for(var i = 0; i<leg.steps.length; ++i){
            if(leg.steps[i].travel_mode=="TRANSIT"){
              message += "\nDeparture: " + leg.steps[i].transit_details.departure_time.text + " from " + leg.steps[i].transit_details.departure_stop.name;
              message += "\nArrival: " +leg.steps[i].transit_details.arrival_time.text + " at " + leg.steps[i].transit_details.arrival_stop.name;
              message += "\nLine: " +leg.steps[i].transit_details.line.short_name;
            }
          }
        }
        console.log(message);
        return send(
            receiver,
            sender,
            message
        )
    })
}
