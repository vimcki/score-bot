import * as web3 from '@solana/web3.js';

import * as serum from "@project-serum/serum"

import {Resource} from "./../../resource_calculator/calc"
var factory = require("@staratlas/factory")

type ResupplyFunc = (connection: web3.Connection, tokenOwnerPublickey: web3.PublicKey, playerPublicKey: web3.PublicKey, resourceQuantity: number, shipMint: web3.PublicKey, resourceMint: web3.PublicKey, resourceTokenAccount: web3.PublicKey, programId: web3.PublicKey) => Promise<web3.TransactionInstruction>;

export default class AnyResource {
	resource: Resource
	userPublicKey: web3.PublicKey
	scoreProgramID: web3.PublicKey
	resourceMint: web3.PublicKey
	resupplyFunc: ResupplyFunc

	constructor(resource: Resource, userPublicKey: web3.PublicKey, scoreProgramID: web3.PublicKey, resourceMint: web3.PublicKey) {
		this.resource = resource
		this.scoreProgramID = scoreProgramID
		this.userPublicKey = userPublicKey
		this.resourceMint = resourceMint
		switch (resource) {
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

	async get(connection: web3.Connection, ammount: number, shipMint: web3.PublicKey): Promise<web3.TransactionInstruction> {
		let resourceResp: web3.RpcResponseAndContext<any>
		while (true) {
			try {
				resourceResp = await connection.getTokenAccountsByOwner(
					this.userPublicKey,
					{mint: this.resourceMint}
				)
				break
			} catch (error) {
				const msg = error.message
				if (msg.includes("502 Bad Gateway")) {
					console.log("502 Bad Gateway")
				} else {
					throw error
				}
			}
		}
		const resourceTokenAccount = resourceResp.value[0].pubkey

		const instruction = await this.resupplyFunc(
			connection,
			this.userPublicKey,
			this.userPublicKey,
			ammount,
			shipMint,
			this.resourceMint,
			resourceTokenAccount,
			this.scoreProgramID,
		)
		return instruction
	}
}
