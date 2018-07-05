'use strict';
'esversion:6';
require('dotenv').config();
var rl = require('readline-sync')

var mqtt = require('mqtt')
var client = mqtt.connect(process.env.MQTTB);

client.on('connect', function () {

    var topic = rl.question('Enter a topic: ');
    var message = rl.question('Enter a message: ');

    client.publish(topic, message);

})