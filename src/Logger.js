const fs = require('fs')
const pino = require('pino')
const CONFIG = require('../config/config.json')

const LOG_DIR = `${__dirname}/../logs`
const PINO_OPTS = {
  level: CONFIG.LOG.LEVEL,
  timestamp: () => `,"time":"${new Date().toLocaleString()}"`,
  formatters: {
    level: (label, number) => {
      return { level: number }
    }
  },
  base: null
}

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR)
}

const Loggers = {
  LINE: '-'.repeat(50),
  signal: pino(PINO_OPTS, pino.destination(`${LOG_DIR}/signal.log`)),
  execution: pino(PINO_OPTS, pino.destination(`${LOG_DIR}/execution.log`))
}

module.exports = Loggers
