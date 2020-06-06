class Logger {
  constructor() {
    this.infoEnabled = true;
    this.warnEnabled = true;
    this.errorEnabled = true;
  }

  /**
   * Log a message.
   * @param {...any} args Message to log
   */
  info(...args) {
    if (this.infoEnabled) {
      console.log('\u001b[92minfo\u001b[37m', ...args);
    }
  }

  /**
   * Log a warning.
   * @param {...any} args Message to log
   */
  warn(...args) {
    if (this.warnEnabled) {
      console.error('\u001b[93mwarning!\u001b[37m', ...args);
    }
  }

  /**
   * Log an error.
   * @param {...any} args Message to log
   */
  error(...args) {
    if (this.errorEnabled) {
      console.error('\u001b[91merror!\u001b[37m', ...args);
    }
  }
}

module.exports = new Logger();
