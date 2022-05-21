import * as web3 from '@solana/web3.js';

const confirmOptions = {
	commitment: 'processed' as web3.Commitment,
}

export default class TransactionSender {
	keypair: web3.Keypair
	constructor(keypair: web3.Keypair) {
		this.keypair = keypair
	}

	async send(connection: web3.Connection, transaction: web3.Transaction): Promise<[web3.TransactionSignature, Error | null]> {
		let signature: string
		while (true) {
			try {
				signature = await web3.sendAndConfirmTransaction(
					connection,
					transaction,
					[this.keypair],
					confirmOptions,
				);
				console.log("success")
				break
			} catch (err) {
				let msg = 'Unknown Error'
				if (err instanceof Error) msg = err.message
				if (msg.includes("Transaction was not confirmed in")) {
					console.log("sender, ERR transcation not confirmed")
				} else if (msg.includes("Error processing Instruction")) {
					console.log("sender, ERR prcoessing instruction")
					return ['', err as Error]
				} else if (msg.includes("Blockhash not found")) {
					console.log("sender, ERR blockhash not found")
				} else if (msg.includes("Node is behind by")) {
					console.log("sender, ERR node is behind")
				} else if (msg.includes("Transaction too large")) {
					console.log("sender, ERR transaction too large")
					return ['', err as Error]
				} else if (msg.includes("502 Bad Gateway")) {
					console.log("sender, 502 Bad Gateway")
				} else if (msg.includes("500 Internal Server Error")) {
					console.log("sender, 500 Internal Server Error")
				} else if (msg.includes("504 Gateway Time-out")) {
					console.log("sender, 504 Gateway Time-out")
				} else if (msg.includes("Node is unhealthy")) {
					console.log("sender, Node is unhealthy")
				} else if (msg.includes("block height exceeded")) {
					console.log("block height exceeded")
				} else {
					console.log(err)
					return ['', err as Error]
				}
			}
		}
		return [signature, null]
	}
}
