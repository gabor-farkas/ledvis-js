var pwm

if (process.env.DEBUG) {
  pwm = require('./build/Debug/pwm.node')
} else {
  pwm = require('./build/Release/pwm.node')
}

module.exports = pwm
