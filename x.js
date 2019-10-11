const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm()
console.log(pwm.test(1));