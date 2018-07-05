'use strict';
'esversion:6';
require('dotenv').config();

var mqtt = require('mqtt')
var client  = mqtt.connect(process.env.MQTTB);
 
client.on('connect', function () {
  client.subscribe('#');
})
 
client.on('message', function (topic, msg) {
  // message is Buffer
  var message = msg.toString('utf8');
  sendToHub(message);
});

const clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var azure_client = clientFromConnectionString(process.env.DCS);

var sendToHub = (data) => {
    let message = new Message(data);

    azure_client.sendEvent(message, (err, res) => {
        if (err)
            console.log('Message sending error: ' + err.toString());
        else
        if (res)
            console.log('value sent to Iot Hub: ' + JSON.stringify(message));
    });
}
