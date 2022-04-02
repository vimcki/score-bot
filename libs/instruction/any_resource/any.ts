import * as web3 from '@solana/web3.js';

import {Resource, ResourceCalculator} from "./../../resource_calculator/calc"
var factory = require("@staratlas/factory")

type ResupplyFunc = (connection: web3.Connection, tokenOwnerPublickey: web3.PublicKey, playerPublicKey: web3.PublicKey, resourceQuantity: number, shipMint: web3.PublicKey, resourceMint: web3.PublicKey, resourceTokenAccount: web3.PublicKey, programId: web3.PublicKey) => Promise<web3.TransactionInstruction>;

export default class AnyResource{
	resource: Resource
	userPublicKey: web3.PublicKey
	scoreProgramID: web3.PublicKey
	resourceMint: web3.PublicKey
	resourceCalc: ResourceCalculator
	resupplyFunc: ResupplyFunc

	constructor(resource: Resource, userPublicKey: web3.PublicKey, scoreProgramID: web3.PublicKey, resourceMint:web3.PublicKey, resourceCalc: ResourceCalculator){
		this.resource = resource
		this.scoreProgramID = scoreProgramID
		this.userPublicKey = userPublicKey
		this.resourceMint = resourceMint
		this.resourceCalc = resourceCalc
		switch(resource){
			case Resource.Food: {
				this.resupplyFunc = factory.createRefeedInstruction
				break
			}
			case Resource.Arms: {
				this.resupplyFunc = factory.createRearmInstruction
				break
			}
			case Resource.Fuel: {
				this.resupplyFunc = factory.createRefuelInstruction
				break
			}
			case Resource.Toolkit: {
				this.resupplyFunc = factory.createRepairInstruction
				break
			}
			default: {
				throw new Error("no resupply function")
			}
		}
	}

	async get(connection: web3.Connection, shipMint: web3.PublicKey): Promise<web3.TransactionInstruction>{
		const resourceResp = await connection.getTokenAccountsByOwner(this.userPublicKey, {mint: this.resourceMint})
		const resourceTokenAccount = resourceResp.value[0].pubkey

		const shipScoreVars =	await factory.getScoreVarsShipInfo(connection, this.scoreProgramID, shipMint)
		const data =	await factory.getShipStakingAccountInfo(connection, this.scoreProgramID, shipMint, this.userPublicKey)
		const resourceToFeed = this.resourceCalc.resupply(this.resource, shipScoreVars, data)
		const instruction = await this.resupplyFunc(
			connection,
		 	this.userPublicKey,
		 	this.userPublicKey,
		 	resourceToFeed,
		 	shipMint,
		 	this.resourceMint,
			resourceTokenAccount,
		 	this.scoreProgramID,
		)
		return instruction
	}
}
