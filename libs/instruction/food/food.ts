import * as web3 from '@solana/web3.js';

import {Resource, ResourceCalculator} from "./../../resource_calculator/calc"
var factory = require("@staratlas/factory")

export default class Food{
	userPublicKey: web3.PublicKey
	scoreProgramID: web3.PublicKey
	foodMint: web3.PublicKey
	resourceCalc: ResourceCalculator

	constructor(userPublicKey: web3.PublicKey, scoreProgramID: web3.PublicKey, foodMint:web3.PublicKey, resourceCalc: ResourceCalculator){
		this.scoreProgramID = scoreProgramID
		this.userPublicKey = userPublicKey
		this.foodMint = foodMint
		this.resourceCalc = resourceCalc
	}

	async get(connection: web3.Connection, shipMint: web3.PublicKey): Promise<web3.TransactionInstruction>{
		const foodResp = await connection.getTokenAccountsByOwner(this.userPublicKey, {mint: this.foodMint})
		const foodTokenAccount = foodResp.value[0].pubkey

		const shipScoreVars =	await factory.getScoreVarsShipInfo(connection, this.scoreProgramID, shipMint)
		const data =	await factory.getShipStakingAccountInfo(connection, this.scoreProgramID, shipMint, this.userPublicKey)
		const foodToFeed = this.resourceCalc.resupply(Resource.Food, shipScoreVars, data)
		const instruction = await factory.createRefeedInstruction(
			connection,
		 	this.userPublicKey,
		 	this.userPublicKey,
		 	foodToFeed,
		 	shipMint,
		 	this.foodMint,
			foodTokenAccount,
		 	this.scoreProgramID,
		)
		return instruction
	}
}
