const { Keypair, PublicKey, Connection } = require('@solana/web3.js')
const { Market } = require('@project-serum/serum')
const bs58 = require('bs58')
const KEYS = require('../../config/keys.json')
const MARKETS = require('../../config/markets.json')
const CONFIG = require('../../config/config.json')

async function main () {
  let connection = new Connection(CONFIG.QUICK_NODE)
  let secret_key = KEYS.PHANTOM.secret
  let owner = Keypair.fromSecretKey(bs58.decode(secret_key))
  let payer = new PublicKey('AR63iAB7dBisuRKWhMEtoJCmZ8Qo8KYbPCguMfjjv15U')
  let marketAddress = new PublicKey(MARKETS.SERUM.MARKETS['SOL/USDC'])
  let programAddress = new PublicKey(MARKETS.SERUM.PROGRAM_ADDRESS)
  let market = await Market.load(connection, marketAddress, {}, programAddress)
  
  await market.placeOrder(connection, {
    owner,
    payer,
    side: 'sell',
    price: 40000,
    size: 0.1,
    orderType: 'limit'
  })
  
  console.log(endTime - startTime);
}

main()
