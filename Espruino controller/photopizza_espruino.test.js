/**
 * File: photopizza_espruino.js
 * Created on: August 30, 2017
 * Description:
 * PhotoPizza DIY is an open source project of 360° product photography turntable.
 *
 * Author: Vladimir Matiyasevith <vladimir.m@makerdrive.ru>
 * Project Site: PhotoPizza.org
 *
 * Copyright: 2017 MakerDrive
 * Copying permission statement:
 *  This file is part of PhotoPizza DIY.
 *
 *  PhotoPizza DIY is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

this.ShowVersion = 'PhotoPizza v3.4';

this.f = new (require("FlashEEPROM"))();
require("SSD1306");
require("Font8x16").add(Graphics);

this.saved = E.toString(this.f.read(0));

//MEMORY
if (this.saved != 'saved') {
  console.log('start save');
  this.f.write(0, 'saved');
  this.f.write(1, '109295');//allsteps
  this.f.write(2, '36');//frame
  this.f.write(3, '100');//pause
  this.f.write(4, '300');//shootingTime
  this.f.write(5, '5000');//speed
  this.f.write(6, '2000');//acceleration
  this.f.write(7, 'inter');//shootingMode
  this.f.write(8, '1');//direction
}

this.frame = E.toString(this.f.read(2)) * 1;
this.allSteps = E.toString(this.f.read(1)) * 1;
this.pause = E.toString(this.f.read(3)) * 1;
this.frameTime = E.toString(this.f.read(4)) * 1;
this.speed = E.toString(this.f.read(5)) * 1;
this.acceleration = E.toString(this.f.read(6)) * 1;
this.shootingMode = E.toString(this.f.read(7)) + '';
this.direction = E.toString(this.f.read(8)) * 1;

this.irCode = 0;
this.irDigital = '1';
this.simNum = 0;

//DISPLAY
this.marker = 0;
this.indent = 13;
this.dispay_2 = false;
this.setupMode = false;
this.dirDisplay = '';

//STEPPER
this.pinStep = P9;
this.pinEn = P12;
this.pinDir = P10;

digitalWrite(this.pinStep, 0);
digitalWrite(this.pinEn, 1);
digitalWrite(this.pinDir, this.direction);

//RELAY
this.pinRelay = P5;
this.relayOn = false;
this.rOn = 1;
this.rOff = 0;
digitalWrite(this.pinRelay, this.rOff);
//P8.mode('analog');

//FLAGS
this.startFlag = false;

require("IRReceiver").connect(A0, function(code) {
  var _code = parseInt(code, 2);
  var btn = '';

  if (_code === 6450803341 || _code === 25803213367) {
    btn = 1;
    console.log(btn);
  }
  if (_code === 6450819151 || _code === 25803276607) {
    btn = 2;
    console.log(btn);
  }
  if (_code === 6450786511 || _code === 25803146047) {
    btn = 3;
    console.log(btn);
  }
  if (_code === 6450795181 || _code === 25803180727) {
    btn = 4;
    console.log(btn);
  }
  if (_code === 6450810991 || _code === 25803243967) {
    btn = 5;
    console.log(btn);
  }
  if (_code === 6450778351 || _code === 25803113407) {
    btn = 6;
    console.log(btn);
  }
  if (_code === 6450799261 || _code === 25803197047) {
    btn = 7;
    console.log(btn);
  }
  if (_code === 6450815071 || _code === 25803260287) {
    btn = 8;
    console.log(btn);
  }
  if (_code === 6450782431 || _code === 25803129727) {
    btn = 9;
    console.log(btn);
  }
  if (_code === 6450806911 || _code === 25803227647) {
    btn = 0;
    console.log(btn);
  }

  if (_code === 25803148087 || _code === 6450787021) {
    btn = 'CALIBR';
    console.log(btn);
  }
  if (_code === 6450774781 || _code === 25803099127) {
    btn = 'R POWER';
    console.log(btn);
  }
  if (_code === 6450823741 || _code === 25803294967) {
    btn = 'SETUP';
    console.log(btn);
  }
  if (_code === 6450800791 || _code === 25803203167) {
    btn = 'UP';
    console.log(btn);
  }
  if (_code === 6450796711 || _code === 25803186847) {
    btn = 'DOWN';
    console.log(btn);
  }
  if (_code === 6450809461 || _code === 25803237847) {
    btn = 'LEFT';
    console.log(btn);
  }
  if (_code === 6450776821 || _code === 25803107287) {
    btn = 'RIGHT';
    console.log(btn);
  }
  if (_code === 6450825271 || _code === 25803301087) {
    btn = 'OK';
    console.log(btn);
  }
  if (_code === 6450813031 || _code === 25803252127) {
    btn = '90DEG';
    console.log(btn);
  }
  console.log(_code);
  
  if (this.setupMode && btn === 1 || this.setupMode && btn === 2 || this.setupMode && btn === 3 || this.setupMode && btn === 4 || this.setupMode && btn === 5 || this.setupMode && btn === 6 || this.setupMode && btn === 7 || this.setupMode && btn === 8 || this.setupMode && btn === 9 || this.setupMode && btn === 0) {
  console.log('input');
    IrInput(btn);
    return;
  }
  if (btn === 'SETUP' && !this.setupMode && !this.poweroff) {
    SettingsDisplay_1();
    console.log('Setup');
    this.simNum = 0;
    return;
  } else if (btn === 'SETUP' && this.setupMode) {
    this.setupMode = false;
    NumControl();
    StartDisplay();
    console.log('Setup Exit');
    return;
  }
  if (btn === 'OK' && this.startFlag && !this.poweroff || btn === 'OK' && this.infiniteFlag && !this.poweroff) {
    this.startFlag = false;
    this.infiniteFlag = false;
    BtnStop();
    console.log('OK STOP');
    this.simNum = 0;
    return;
  }
  if (btn === 'OK' && !this.infiniteFlag && !this.startFlag && !this.poweroff) {
    this.startFlag = true;
    StartDisplay();
    Start();
    console.log('OK START');
    this.simNum = 0;
    return;
  }
  if (btn === 'DOWN' && !this.dispay_2 && this.setupMode) {
    this.marker = this.marker + this.indent;
    SettingsDisplay_1();
    this.simNum = 0;
    console.log('Down D1');
    return;
  } else if (btn === 'DOWN' && this.dispay_2 && this.setupMode) {
    this.marker = this.marker + this.indent;
    SettingsDisplay_2();
    console.log('Down D2');
    this.simNum = 0;
    return;
  }
   if (btn === 'UP' && !this.dispay_2 && this.setupMode) {
    this.marker = this.marker - this.indent;
    SettingsDisplay_1();
    this.simNum = 0;
    console.log('UP D1');
    return;
  } else if (btn === 'UP' && this.dispay_2 && this.setupMode) {
    this.marker = this.marker - this.indent;
    SettingsDisplay_2();
    console.log('UP D2');
    this.simNum = 0;
    return;
  }
  if (btn === 'RIGHT' && !this.dispay_2 && this.setupMode) {
    SettingsDisplay_2();
    console.log('Right');
    this.simNum = 0;
    return;
  }
  if (btn === 'LEFT' && this.dispay_2 && this.setupMode) {
    SettingsDisplay_1();
    console.log('Left');
    this.simNum = 0;
    return;
  }
  if (btn === 'RIGHT' && !this.setupMode && !this.startFlag) {
    digitalWrite(this.pinDir, 1);
    digitalWrite(this.pinStep, 0);
    digitalWrite(pinEn, 1);
    this._speed = 1;
    infiniteRotation();
    console.log('Right rotation');
    return;
  }
  if (btn === 'LEFT' && !this.setupMode && !this.startFlag) {
    digitalWrite(this.pinDir, 0);
    digitalWrite(this.pinStep, 0);
    digitalWrite(pinEn, 1);
    this._speed = 1;
    infiniteRotation();
    console.log('Left rotation');
    return;
  }
  if (btn === 'CALIBR' && !this.calibration && !this.poweroff) {
    Calibration();
    return;
  } else if (btn === 'CALIBR' && this.calibration && !this.poweroff) {
    this.calibration = false;
    Stop();
  }
  this.deg90flag = false;
  if (btn === '90DEG' && !this.calibration && !this.poweroff && !this.deg90flag) {
    this.deg90flag = true;
    deg90();
    return;
  } else if (btn === '90DEG' && this.calibration && !this.poweroff) {
    this.deg90flag = false;
    Stop();
  }
  if (btn === 'R POWER' && !this.poweroff) {
    this.g.off();
    this.poweroff = true;
    Stop();
    return;
  } else if (btn === 'R POWER' && this.poweroff) {
    this.g.on();
    this.poweroff = false;
    LogoDisplay();
    return;
  }
});

function LogoDisplay(){
  
  var x1x2 = 1;
  this.g.clear();
  this.g.setFontBitmap();
  this.g.setFont8x16();
  this.g.drawString(this.ShowVersion, 10, 45);
  this.g.flip();
  var preloader = setInterval(function () {
    this.g.drawLine(x1x2, 20, x1x2, 30);
    x1x2 += 2;
    this.g.drawLine(x1x2, 20, x1x2, 30);
    x1x2 += 2;
    this.g.drawLine(x1x2, 20, x1x2, 30);
    x1x2 += 2;
    this.g.drawLine(x1x2, 20, x1x2, 30);
    x1x2 += 2;
    this.g.drawLine(x1x2, 20, x1x2, 30);
    x1x2 += 2;
    this.g.drawLine(x1x2, 20, x1x2, 30);
    x1x2 += 2;
    this.g.flip();
    if (x1x2 > 126) {
      clearInterval(preloader);
      NumControl();
      StartDisplay();
    }
  }, 10);
}

function StartDisplay(){
  this.g.clear();
  this.g.setFontVector(35);
  this.g.drawString(this._frame + ' f', 0, 0);
  this.g.flip();
  this.g.setFontBitmap();
  this.g.setFont8x16();
  this.g.drawString(Math.floor(this._shootingTime / 1000) + ' SECONDS', 0, 45);
  this.g.flip();
}

function SettingsDisplay_1(){
  this.setupMode = true;
  this.dispay_2 = false;

  if (this.marker > this.indent * 4) {
    this.marker = 0;
  } else if (this.marker < 0) {
    this.marker = this.indent * 4;
  }

  this.g.clear();

  this.g.setFontBitmap();
  this.g.setFont8x16();
  this.g.drawString('>', 1, this.marker);
  this.g.drawString('>', 117, 28);
  this.g.drawString('1', 117, 0);

  this.g.drawLine(112, 0, 112, 127);

  this.nameIndent = 48;

  this.g.drawString('frame', 8, 0);
  this.g.drawString('=', this.nameIndent, 0);
  this.g.drawString(this.frame, 57, 0);

  this.g.drawString('delay', 8, this.indent);
  this.g.drawString('=', this.nameIndent, this.indent);
  this.g.drawString(this.frameTime, 57, this.indent);

  this.g.drawString('pause', 8, this.indent * 2);
  this.g.drawString('=', this.nameIndent, this.indent * 2);
  this.g.drawString(this.pause, 57, this.indent * 2);

  this.g.drawString('speed', 8, this.indent * 3);
  this.g.drawString('=', this.nameIndent, this.indent * 3);
  this.g.drawString(this.speed, 57, this.indent * 3);

  this.g.drawString('accel', 8, this.indent * 4);
  this.g.drawString('=', this.nameIndent, this.indent * 4);
  this.g.drawString(this.acceleration, 57, this.indent * 4);

  this.g.flip();
}

function SettingsDisplay_2(){
  if (this.direction === 1) {
    this.dirDisplay = 'right';
  } else {
    this.dirDisplay = 'left';
  }
  
  this.setupMode = true;
  this.dispay_2 = true;

  if (this.marker > this.indent * 2) {
    this.marker = 0;
  } else if (this.marker < 0) {
    this.marker = this.indent * 2;
  }

  this.g.clear();

  this.g.setFontBitmap();
  this.g.setFont8x16();
  this.g.drawString('>', 1, this.marker);
  this.g.drawString('<', 117, 28);
  this.g.drawString('2', 117, 0);

  this.g.drawLine(112, 0, 112, 127);

  this.nameIndent = 48;

  this.g.drawString('mode', 8, 0);
  this.g.drawString('=', this.nameIndent, 0);
  this.g.drawString(this.shootingMode, 57, 0);

  this.g.drawString('direc', 8, this.indent);
  this.g.drawString('=', this.nameIndent, this.indent);
  this.g.drawString(this.dirDisplay, 57, this.indent);

  this.g.drawString('steps', 8, this.indent * 2);
  this.g.drawString('=', this.nameIndent, this.indent * 2);
  this.g.drawString(this.allSteps, 57, this.indent * 2);

  this.g.flip();
}

function IrInput(btn) {

  this.irDigital = btn + '';

  if (!this.dispay_2 && this.marker === 0 && this.simNum <= 7 && this.simNum > 0) {
    this.frame = (this.frame + this.irDigital) * 1;
    NumControl();
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === 0 && this.simNum === 0 && this.irDigital != '0') {
    this.frame = '';
    this.frame = (this.frame + this.irDigital) * 1;
    NumControl();
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent && this.simNum <= 7 && this.simNum > 0) {
    this.frameTime = (this.frameTime + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent && this.simNum === 0 && this.irDigital != '0') {
    this.frameTime = '';
    this.frameTime = (this.frameTime + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent * 2 && this.simNum <= 7 && this.simNum > 0) {
    this.pause = (this.pause + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent * 2 && this.simNum === 0 && this.irDigital != '0') {
    this.pause = '';
    this.pause = (this.pause + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent * 3 && this.simNum <= 7 && this.simNum > 0) {
    this.speed = (this.speed + this.irDigital) * 1;
    NumControl();
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent * 3 && this.simNum === 0 && this.irDigital != '0') {
    this.speed = '';
    this.speed = (this.speed + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent * 4 && this.simNum <= 7 && this.simNum > 0) {
    this.acceleration = (this.acceleration + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }
  if (!this.dispay_2 && this.marker === this.indent * 4 && this.simNum === 0 && this.irDigital != '0') {
    this.acceleration = '';
    this.acceleration = (this.acceleration + this.irDigital) * 1;
    SettingsDisplay_1();
    this.simNum++;
  }

  //DISPLAY 2
  if (this.dispay_2 && this.marker === 0 && this.irDigital === '1') {
    this.shootingMode = 'inter';
    SettingsDisplay_2();
  }
  if (this.dispay_2 && this.marker === 0 && this.irDigital === '2') {
    this.shootingMode = 'seria';
    SettingsDisplay_2();
  }
  if (this.dispay_2 && this.marker === 0 && this.irDigital === '3') {
    this.shootingMode = 'nonST';
    SettingsDisplay_2();
  }
  if (this.dispay_2 && this.marker === 0 && this.irDigital === '4') {
    this.shootingMode = 'PingP';
    SettingsDisplay_2();
  }
   if (this.dispay_2 && this.marker === this.indent && this.irDigital === '1') {
    this.direction = 1;
    SettingsDisplay_2();
  }
  if (this.dispay_2 && this.marker === this.indent && this.irDigital === '2') {
    this.direction = 0;
    SettingsDisplay_2();
  }
  if (this.dispay_2 && this.marker === this.indent * 2 && this.simNum <= 7 && this.simNum > 0) {
    this.allSteps = (this.allSteps + this.irDigital) * 1;
    NumControl();
    SettingsDisplay_2();
    this.simNum++;
  }
  if (this.dispay_2 && this.marker === this.indent * 2 && this.simNum === 0 && this.irDigital != '0') {
    this.allSteps = '';
    this.allSteps = (this.allSteps + this.irDigital) * 1;
    NumControl();
    SettingsDisplay_2();
    this.simNum++;
  }
}

function NumControl() {
  if ((E.toString(this.f.read(1)) * 1) != this.allSteps + '' && !this.setupMode) {
    this.f.write(1, this.allSteps + '');
    console.log('save allSteps');
  }
  if ((E.toString(this.f.read(2)) * 1) != this.frame + '' && !this.setupMode) {
    this.f.write(2, this.frame + '');
    console.log('save frame');
  }
  if ((E.toString(this.f.read(5)) * 1) != this.speed + '' && !this.setupMode) {
    this.f.write(5, this.speed + '');
    console.log('save speed');
  }
  if (E.toString(this.f.read(7)) != this.shootingMode && !this.setupMode) {
    this.f.write(7, this.shootingMode);
    console.log('save shootingMode');
  }
  if ((E.toString(this.f.read(8)) * 1) != this.direction + '' && !this.setupMode) {
    this.f.write(8, this.direction + '');
    console.log('save direction');
  }
  if ((E.toString(this.f.read(6)) * 1) != this.acceleration + '' && !this.setupMode) {
    this.f.write(6, this.acceleration + '');
    console.log('save acceleration');
  }
  
  this._frame = this.frame;
  this._speed = 1;
  this.frameSteps = this.allSteps / this.frame;
  this.stepperTime = this.frameSteps / this.speed * 1000;
  this.accelerationSteps = this.frameSteps / 4;
  this.accelerationTime = (this.stepperTime / 4) * 2; 
  
  this.accSpeed = 10;
  this.shootingTime1F = this.pause + this.frameTime + this.stepperTime;
  this.shootingTime = this.shootingTime1F * this.frame;
  this._shootingTime = this.shootingTime;
  this.nonStopTimerSpeed = this.stepperTime;

  this.accStep = this.accelerationSteps / (this.accelerationTime / this.accSpeed);
  console.log('this.accStep= ' + this.accStep);

  digitalWrite(this.pinDir, this.direction);

  console.log('NumControl');
}

function Start() {
  console.log(this._frame);
  digitalWrite(pinEn, 0);
  if (this.shootingMode === 'nonST') {
    this.startFlag = true;
    nonStop();
    return;
  }
  if (this._frame > 0) {
    this.startFlag = true;
    ShotingPause();
  } else {
    Stop();
  }
}

function Stop() {
  console.log('stop');
  clearInterval();
  this.startFlag = false;
  digitalWrite(this.pinStep, 0);
  digitalWrite(pinEn, 1);
  digitalWrite(this.pinRelay, this.rOff);
  //P8.mode('analog');
  NumControl();
  StartDisplay();
}

function StepperAccMax() {
  if (!this.startFlag) {
    return;
  }
  this._speed = 1;
  var totalSteps = 0;

  var accTimerMax = setInterval(function () {
    analogWrite(this.pinStep, 0.5, { freq: this._speed } );
    this._speed += this.accStep;
    var iterationSteps = (this.accSpeed / 1000) * this._speed;
    
    if (totalSteps >= this.accelerationSteps) {
      clearInterval(accTimerMax);
      Stepper();
      return;
    }
    totalSteps += iterationSteps;
  }, this.accSpeed);
}

function nonStop() {
  if (!this.startFlag) {
    return;
  }
  shot();
  this._frame--;
  StartDisplay();
  analogWrite(this.pinStep, 0.5, { freq : this.speed } );
  var nonStopInterval = setInterval(function () {
    if (this._frame <= 0) {
      clearInterval(nonStopInterval);
      Stop();
      return;
    }
    shot();
    this._frame--;
    StartDisplay();
  }, this.nonStopTimerSpeed);
}

function shot() {
  if (!this.startFlag) {
    return;
  }
  console.log('shot');
  digitalWrite(this.pinRelay, this.rOn);
  this.relayOn = true;
  this.shotTimer = setTimeout(function () {
    digitalWrite(this.pinRelay, this.rOff);
    this.relayOn = false;
    clearTimeout(this.shotTimer);
  }, 100);
}

function Stepper() {
  if (!this.startFlag) {
    return;
  }
  analogWrite(this.pinStep, 0.5, { freq : this.speed } );
  
  this.stepTimer = setTimeout(function () {
    clearTimeout(this.stepTimer);
    StepperAccMin();
  }, this.stepperTime / 2);
}

function StepperAccMin() {
  if (!this.startFlag) {
    return;
  }
  this._speed = this.speed;
  var totalSteps = 0;

  var accTimerMin = setInterval(function () {
    analogWrite(this.pinStep, 0.5, { freq: this._speed } );
    this._speed -= this.accStep;
    var iterationSteps = (this.accSpeed / 1000) * this._speed;
    if (totalSteps >= this.accelerationSteps || iterationSteps <= 10) {
      clearInterval(accTimerMin);
      this._shootingTime = this._shootingTime - this.shootingTime1F;
      Start();
    }
    totalSteps += iterationSteps;
  }, this.accSpeed);
}

function ShotingPause() {
  if (!this.startFlag) {
    return;
  }
  this.pauseTimer = setTimeout(function () {
  Relay();
    clearTimeout(this.pauseTimer);
  }, this.pause);

}

function Relay() {
  if (!this.startFlag) {
    return;
  }
  console.log('Relay');

  if (this._frame > 0 && this.startFlag) {
    this.relayOn = true;
    digitalWrite(this.pinRelay, this.rOn);
    //P8.mode('output');
    this._frame--;
    this.frameTimer = setTimeout(function () {
      digitalWrite(this.pinRelay, this.rOff);
      //P8.mode('analog');
      this.relayOn = false;
      StartDisplay();
      StepperAccMax();
      clearTimeout(this.frameTimer);
    }, this.frameTime);
  } else {
    Stop();
  }
}

function BtnStop() {
  console.log('BtnStop');
      Stop();
}

function infiniteRotation() {

  this.infiniteFlag = true;
  this.g.clear();
  this.g.setFontVector(20);
  this.g.drawString('infinite', 0, 0);
  this.g.flip();

  digitalWrite(this.pinEn, 0);

  var accTimerMax = setInterval(function () {
    analogWrite(this.pinStep, 0.5, { freq : this._speed } );
    this._speed = this._speed + this.acceleration;
    if (this._speed >= this.speed) {
      clearInterval(accTimerMax);
      analogWrite(this.pinStep, 0.5, { freq : this.speed } );
    }
  }, this.accSpeed);
}

function deg90() {
  this.g.clear();
  this.g.setFontVector(20);
  this.g.drawString('turn to 90', 0, 0);
  this.g.flip();

  digitalWrite(this.pinEn, 0);
  analogWrite(this.pinStep, 0.5, { freq : this.speed } );
  var turn = 0;
  setInterval(function () {
    if (turn >= this.allSteps / 4) {
      Stop();
      this.deg90flag = false;
    }
    turn = turn + (this.speed / 1000);
 }, 1);
}

function Calibration() {
  this.calibration = true;
  this.g.clear();
  this.g.setFontVector(20);
  this.g.drawString('calibration', 0, 0);
  this.g.flip();

  digitalWrite(this.pinEn, 0);
  this.step1 = true;
  this.allSteps = 0;
  analogWrite(this.pinStep, 0.5, { freq : this.speed } );
  
  setInterval(function () {
    this.allSteps = this.allSteps + (this.speed / 1000);
 }, 1);
}

this.loadingTimer = setTimeout(function () {
  
  this.g = require("SSD1306").connect(I2C1, LogoDisplay);
      clearTimeout(this.loadingTimer);
    }, 100);
function onInit() {
 I2C1.setup({scl:B8, sda:B9});
}