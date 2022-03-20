import * as web3 from '@solana/web3.js'

const url = "https://solana--mainnet.datahub.figment.io/apikey/a273d5bc3ab79337e4c0dafc0c45d6df"
const headers = {
	'accept': '*/*',
	'accept-encoding': 'gzip, deflate, br',
	'accept-language': 'en-US,en;q=0.9',
	'content-type': 'application/json',
	'origin': 'https://play.staratlas.com',
	'referer': 'https://play.staratlas.com/',
	'sec-fetch-dest': 'empty',
	'sec-fetch-mode': 'cors',
	'sec-fetch-site': 'cross-site',
	'sec-gpc': '1',
	'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.87 Safari/537.36',
}

const config = {
	httpHeaders: headers,
}

let connection = new web3.Connection(url, config)
export default connection
