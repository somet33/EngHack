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
    var weather = '';


    return new Promise(function(resolve, reject){
        https.get('https://maps.googleapis.com/maps/api/directions/json?origin=181LesterStreet,Waterloo&destination=OpentextCorporation,Waterloo&mode=transit&transit=bus&key=AIzaSyABIq79BuPfXIQcoWTfj9I1D3fU3X8DCf4', function (res){
          /*  let string = '';
            res.on('data', function(data){
                weather = data.toString();
                string = weather;
                //console.log(weather);
                //resolve(JSON.parse(weather));
            })
            res.on('end', function(){
              //weather.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
                //string = JSON.parse((JSON.stringify(weather.toString().trim())));
                //string = (JSON.parse(weather.toString().trim()));
                console.log(string);
                //resolve("JSON.parse(weather)")
                //resolve(JSON.parse(weather));
            });
            */
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
        var message = "From: " + result.routes[0].legs[0].start_address + "To: "+ result.routes[0].legs[0].end_address ;
        for(var i = 0; i<result.routes[0].legs[0].steps.length; ++i){
          if(result.routes[0].legs[0].steps[i].travel_mode=="TRANSIT"){
            message += "\nArrive At: " + result.routes[0].legs[0].steps[i].transit_details.arrival_time.text;
            message += "\nLine: " + result.routes[0].legs[0].steps[i].transit_details.line.short_name;
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
