var moment = require('moment');
var _ = require('lodash');


class Log {
  _write(method, msg) {
    var message = moment().format('YYYY-MM-DD HH:mm:ss');
    message += ` (${method}):\t ${msg} `;
    console[method](message);
  }

  error(msg) { this._write('error', msg) }
  warn(msg)  { this._write('warn', msg); }
  debug(msg)  { this._write('debug', msg); }
  info(msg)  { this._write('info', msg); }
}

module.exports = new Log;