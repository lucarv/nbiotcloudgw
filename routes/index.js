var express = require('express');
var router = express.Router();
module.exports = router;

// mqtt without security
var mqtt = require('mqtt')
var mclient = mqtt.connect('mqtt://telenet-nbiot.westeurope.cloudapp.azure.com')
var devices = require('./devices.json');
var publisher;

// raw udp datagrams
var dgram = require('dgram');
var userver = dgram.createSocket('udp4');
const port = 5683;

var coap = require('coap');
var cserver = coap.createServer()

// azure sdk
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
// hardcode device for now
var cs;

var mqtt_msg_counter = 0;
var udp_msg_counter = 0;
var lastRead = 'unknown';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express', last: lastRead, mqtt: mqtt_msg_counter, pub: publisher });

});

mclient.on('connect', function () {
    console.log('connect')
    mclient.subscribe('devices/#')
})

mclient.on('message', function (topic, message) {
    // message is Buffer
    mqtt_msg_counter++;

    publisher = topic.split(/[.,\/ -]/)[1];
    console.log('publisher: ' + publisher)

    var msg = message.toString();
    var tid = JSON.parse(msg).tid;
    var timestamp = new Date(JSON.parse(msg).tst);
    console.log('message from: ' + publisher + ' at: ' + timestamp)

    for (var i = 0; i < devices.length; i++) {
        if (devices[i].DeviceID === tid) {
            cs = devices[i].cs

            var hubMsg = new Message(msg)
            var aclient = clientFromConnectionString(cs);
            lastRead = new Date().toISOString;
            aclient.sendEvent(hubMsg, function (err, res) {
                if (err)
                    console.log('Message sending error: ' + err.toString());
                else {
                    if (res)
                        console.log('sent from: ' + tid + ' to hub: ' + JSON.stringify(hubMsg));
                }
            })
        }
    }
})