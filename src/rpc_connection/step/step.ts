import * as web3 from '@solana/web3.js'

const url = "https://step.rpcpool.com"
const headers = {
	'authority': 'step.rpcpool.com',
	'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
	'content-type': 'application/json',
	'accept': '*/*',
	'sec-gpc': '1',
	'origin': 'https://app.step.finance',
	'sec-fetch-site': 'cross-site',
	'sec-fetch-mode': 'cors',
	'sec-fetch-dest': 'empty',
	'referer': 'https://app.step.finance/',
	'accept-language': 'en-US,en;q=0.9',
}

const config = {
	httpHeaders: headers,
}

let connection = new web3.Connection(url, config)
export default connection
