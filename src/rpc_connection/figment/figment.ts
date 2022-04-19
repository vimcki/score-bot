import * as web3 from '@solana/web3.js'

require('dotenv').config();

const url = "https://solana--mainnet.datahub.figment.io/apikey/"

let connection = new web3.Connection(url + process.env.FIGMENT_API_KEY)
export default connection
