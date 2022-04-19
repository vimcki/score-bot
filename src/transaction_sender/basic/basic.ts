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
					console.log("ERR transcation not confirmed")
				} else if (msg.includes("Error processing Instruction")) {
					console.log("ERR prcoessing instruction")
					return ['', err as Error]
				} else if (msg.includes("Blockhash not found")) {
					console.log("ERR blockhash not found")
				} else if (msg.includes("Node is behind by")) {
					console.log("ERR node is behind")
				} else if (msg.includes("Transaction too large")) {
					console.log("ERR transaction too large")
					return ['', err as Error]
				} else if (msg.includes("502 Bad Gateway")) {
					console.log("502 Bad Gateway")
				} else {
					console.log(err)
					return ['', err as Error]
				}
			}
		}
		return [signature, null]
	}
}
