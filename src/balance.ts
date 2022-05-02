import * as web3 from '@solana/web3.js';

export default class Balance {
	wallet: web3.PublicKey
	constructor(wallet: web3.PublicKey) {
		this.wallet = wallet
	}
	async get(connection: web3.Connection, mint: web3.PublicKey): Promise<number> {
		while (true) {
			try {
				const tao = {mint: mint}
				const resp = await connection.getTokenAccountsByOwner(this.wallet, tao)
				const tokenWallet = resp.value[0].pubkey
				const accountBalance = await connection.getTokenAccountBalance(tokenWallet)
				return accountBalance.value.uiAmount || 0
			} catch (err) {
				let msg = 'Unknown Error'
				if (err instanceof Error) msg = err.message
				if (msg.includes("502 Bad Gateway")) {
					console.log("balance, 502 Bad Gateway")
					continue
				} else {
					console.log("balance get error: " + msg)
				}
			}
		}
	}
}
