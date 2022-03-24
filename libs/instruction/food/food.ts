import * as web3 from '@solana/web3.js';

var factory = require("@staratlas/factory")

export default class Food{
	userPublicKey: web3.PublicKey
	scoreProgramID: web3.PublicKey
	foodMint: web3.PublicKey
	foodTokenAccount: web3.PublicKey

	constructor(userPublicKey: web3.PublicKey, scoreProgramID: web3.PublicKey, foodMint:web3.PublicKey, foodTokenAccount: web3.PublicKey){
		this.scoreProgramID = scoreProgramID
		this.userPublicKey = userPublicKey
		this.foodMint = foodMint
		this.foodTokenAccount = foodTokenAccount
	}

	async get(connection: web3.Connection, shipMint: web3.PublicKey): Promise<web3.TransactionInstruction>{
		const ship_score_vars =	await factory.getScoreVarsShipInfo(connection, this.scoreProgramID, shipMint)
		const data =	await factory.getShipStakingAccountInfo(connection, this.scoreProgramID, shipMint, this.userPublicKey)
		let now = Date.now()/1000
		const foodPercentageLeft = 1-(now-data.currentCapacityTimestamp)/data.foodCurrentCapacity
		const food_per_second = ship_score_vars.millisecondsToBurnOneFood/1000
		const foodAfterFeeding = data.foodCurrentCapacity/food_per_second
		const foodLeft = foodPercentageLeft*foodAfterFeeding
		let foodToFeed = ship_score_vars.foodMaxReserve - foodLeft
		if (foodToFeed < 1){
			foodToFeed = 1
		}
		const instruction = await factory.createRefeedInstruction(
			connection,
		 	this.userPublicKey,
		 	this.userPublicKey,
		 	foodToFeed,
		 	shipMint,
		 	this.foodMint,
		 	this.foodTokenAccount,
		 	this.scoreProgramID,
		)
		return instruction
	}
}
