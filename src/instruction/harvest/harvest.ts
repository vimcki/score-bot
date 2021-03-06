import * as web3 from '@solana/web3.js';

var factory = require("@staratlas/factory")

export default class Harvest {
	userPublicKey: web3.PublicKey
	scoreProgramID: web3.PublicKey
	atlasMint: web3.PublicKey

	constructor(userPublicKey: web3.PublicKey, scoreProgramID: web3.PublicKey, atlasMint: web3.PublicKey) {
		this.scoreProgramID = scoreProgramID
		this.userPublicKey = userPublicKey
		this.atlasMint = atlasMint
	}

	async get(connection: web3.Connection, shipMint: web3.PublicKey): Promise<web3.TransactionInstruction> {
		let resp: web3.RpcResponseAndContext<any>
		while (true) {
			try {
				resp = await connection.getTokenAccountsByOwner(this.userPublicKey, {mint: this.atlasMint})
				break
			} catch (error) {
				let message = 'Unknown Error'
				if (error instanceof Error) message = error.message
				if (message.includes("502 Bad Gateway")) {
					console.log("502 Bad Gateway")
				} else {
					console.log("harvest get error: " + message)
					throw error
				}
			}
		}
		const myAtlasAccount = resp.value[0].pubkey
		const instructions = await factory.createHarvestInstruction(
			connection,
			this.userPublicKey,
			myAtlasAccount,
			this.atlasMint,
			shipMint,
			this.scoreProgramID,
		)
		return instructions[0]
	}
}
