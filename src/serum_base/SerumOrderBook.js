const debut = require('debug')
const SerumClient = require('./SerumWsClient')

class SerumOrderBook {
  constructor () {
    this._clients = {}
  }

  async client (symbol, { channel = 'level1', socket, ...options }) {
    if (this._clients[symbol] && !this._clients[symbol].connected) {
      delete this._clients[symbol]
    }
    if (!this._clients[symbol]) {
      this._clients[symbol] = new SerumClient({ socket, ...options })
      await this._clients[symbol].open()
      if (this._clients[symbol].connected) {
        await this._clients[symbol].subscribe(
          (symbol = symbol),
          (channel = channel)
        )
      }
      await new Promise(r => setTimeout(r, 2000))
    }
    return this._clients[symbol]
  }

  async watchOrderBook (symbol) {
    const client = await this.client(symbol, 'level1')
    return client._book
  }
}

module.exports = SerumOrderBook
