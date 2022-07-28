import * as web3 from '@solana/web3.js';
import * as factory from "@staratlas/factory"

import {atlasMint, ammoMint, foodMint, fuelMint, toolkitMint} from "./../../addresses"
import {TransactionSender} from "../../transaction_sender/sender"
import {Resource} from "../../resource_calculator/calc"

const gmProgramID = new web3.PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg")

export default class GalacticMarket {
	conn: web3.Connection
	transactionSender: TransactionSender
	ob: factory.GmOrderbookService
	client: factory.GmClientService
	constructor(ts: TransactionSender, conn: web3.Connection) {
		this.conn = conn
		this.transactionSender = ts
		this.ob = new factory.GmOrderbookService(conn, gmProgramID)
		this.client = new factory.GmClientService()
	}
	async init() {
		await this.ob.initialize()
	}
	async end() {
		await this.ob.end()
	}

	async buy(resource: Resource, ammount: number, keypair: web3.Keypair) {
		const resourceMint = getResourceMint(resource)
		console.log(atlasMint.toJSON(), resourceMint.toJSON())
		const sells = this.ob.getSellOrdersByCurrencyAndItem(atlasMint.toJSON(), resourceMint.toJSON())
		sells.sort((a, b) => a.price - b.price)
		const order = sells[0]
		const res = await this.client.getCreateExchangeTransaction(this.conn, order, keypair.publicKey, ammount, gmProgramID)
		await this.transactionSender.send(this.conn, res.transaction)
	}
}

function getResourceMint(resource: Resource) {
	switch (resource) {
		case Resource.Food: {
			return foodMint
		}
		case Resource.Arms: {
			return ammoMint
		}
		case Resource.Fuel: {
			return fuelMint
		}
		case Resource.Toolkit: {
			return toolkitMint
		}
		default: {
			throw new Error("Unknown resource")
		}
	}
}
