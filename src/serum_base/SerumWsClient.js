const debug = require('debug')
const WebSocket = require('ws')

class SerumClient {
  constructor ({ socket, endpoint, heartbeat, ...socketOptions } = {}) {
    this.socketOptions = socketOptions
    this.socket = socket || null
    this.connected = this.socket && this.socket.readyState === WebSocket.OPEN
    this.endpoint = endpoint || 'wss://api.serum-vial.dev/v1/ws'
    this.heartbeat = heartbeat || 15 * 1000
    this.subscriptions = new Set()
    this.lastError = null
    this._book = {}
  }

  async open () {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.socket = new WebSocket(this.endpoint, this.socketOptions)
      }

      let heartbeatInterval

      this.socket.on('open', async () => {
        debug.log('connection opened')
        this.connected = this.socket.readyState === WebSocket.OPEN
        heartbeatInterval = setInterval(() => this.ping(), this.heartbeat)
        return resolve(true)
      })

      this.socket.on('close', () => {
        debug.log('connection closed')
        clearInterval(heartbeatInterval)
        if (!this.connected) {
          return reject(this.lastError)
        }
        this.connected = false
      })

      this.socket.on('error', err => {
        debug('connection error:', err)
        this.lastError = err
      })

      this.socket.on('message', message => {
        if (!message.length || message[0] !== '{') {
          return
        }

        const response = JSON.parse(message) || {}

        if (response.type === 'quote') {
          this._book = response
        }
      })
    }).catch(() => {
      debug.log('cannot establish connection')
    })
  }

  async ping () {
    return new Promise((resolve, reject) =>
      this.socket.send('ping', {}, (err, res) => {
        err ? reject(err) : resolve(res)
      })
    )
  }

  async subscribe (symbol, channel = 'level1') {
    this.subscriptions.add(symbol)

    return this.sendMessage({
      op: 'subscribe',
      channel: channel,
      markets: [symbol]
    })
  }

  async unsubscribe (symbol, channel = 'level1') {
    this.subscriptions.delete(symbol)

    return this.sendMessage({
      op: 'unsubscribe',
      channel: channel,
      markets: [symbol]
    })
  }

  async sendMessage (data) {
    debug('sending:', data)
    const json = JSON.stringify(data)

    return new Promise((resolve, reject) =>
      this.socket.send(json, {}, (err, res) => {
        err ? reject(err) : resolve(res)
      })
    )
  }
}

module.exports = SerumClient
