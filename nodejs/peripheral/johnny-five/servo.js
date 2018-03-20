// Servo Service 0x54E6
const bleno = require('bleno');
const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
  io: new Raspi(),
  repl: false
});
let servo;

board.on("ready", function() {
  servo = new five.Servo("GPIO18");
});

class AngleCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: '54E6',
      properties: ['read', 'write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Angle'
        })
      ]
    });
  }

  onReadRequest(offset, callback) {
    console.log('read request');
    const data = new Buffer([servo.value]);
    callback(this.RESULT_SUCCESS, data);
  }
  
  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log('write request: ' + data.toString('hex'));
    servo.to(data[0]);
    callback(this.RESULT_SUCCESS);
  }  
}

const servoService = new bleno.PrimaryService({
  uuid: '54E6',
  characteristics: [
    new AngleCharacteristic()
  ]
});

bleno.on('stateChange', state => {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Servo', [servoService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', error => {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([servoService]);
  }
});
