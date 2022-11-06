'use strict'

const ccxtpro = require('ccxt.pro')
const SerumOrderBook = require('./serum_base/SerumOrderBook')
const SerumOB = new SerumOrderBook()
const KEYS = require('../config/keys.json')

async function arbSignal (exchange, pair) {
  const orderbook_1 = await exchange['watchOrderBook'](`${pair}/USD`)
  const orderbook_2 = await SerumOB.watchOrderBook(`${pair}/USDC`)

  let bidPremium =
    (orderbook_1['bids'][0][0] - orderbook_2['bestAsk'][0]) /
    orderbook_1['bids'][0][0]
  let askPremium =
    (orderbook_1['asks'][0][0] - orderbook_2['bestBid'][0]) /
    orderbook_2['bestBid'][0]

  if (bidPremium >= 0.001) {
    console.log('====' + pair + '====')
    console.log(bidPremium)
  }

  if (askPremium <= -0.001) {
    console.log('====' + pair + '====')
    console.log(askPremium)
  }
}

async function main () {
  const exchange = new ccxtpro['ftx'](KEYS.FTX)
  await exchange.loadMarkets()
  let symbols = ['ETH', 'BTC', 'BNB', 'SOL', 'AVAX']

  while (true) {
    await Promise.all(symbols.map(symbol => arbSignal(exchange, symbol)))
    await new Promise(r => setTimeout(r, 2000))
  }
}

main()
