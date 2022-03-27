import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./libs/pkg/keypair/secret_key_file/keypair"
import Food from "./libs/instruction/food/food"
import Harvest from "./libs/instruction/harvest/harvest"
import TransactionSender from "./libs/transaction_sender/basic/basic"

//import Puller from "./libs/ships_data/puller/http_get/get"
import connection from "./libs/rpc_connection/sa/sa"
//const ships_puller = new Puller("https://galaxy.staratlas.com/nfts")

const atlasMint = new web3.PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx")
const scoreProgramID = new web3.PublicKey("FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW")
const foodMint = new web3.PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG")

const kpp = new KeypairProvider("/home/user/.config/solana/bank.json")
const keypair = kpp.get()

const harvestInstructionProvider = new Harvest(
	keypair.publicKey,
	scoreProgramID,
	atlasMint,
)

const foodInstructionProvider = new Food(
	keypair.publicKey,
	scoreProgramID,
	foodMint,
)

const transactionSender = new TransactionSender(
	keypair
)

async function go() {
	//const ships = await ships_puller.pull()

	const fleets =	await factory.getAllFleetsForUserPublicKey(connection, keypair.publicKey, scoreProgramID)

	for (let fleet of fleets) {
		const shipMint = fleet.shipMint
		console.log('shipMint: ', shipMint.toJSON());
		const foodInstruction = await foodInstructionProvider.get(connection, shipMint)
		let transaction = new web3.Transaction()
		transaction.add(foodInstruction)
		const foodSignature = await transactionSender.send(connection, transaction)
		console.log("refeed sig: " ,foodSignature)
		let harvestInstruction = await harvestInstructionProvider.get(connection, shipMint)
		let harvestTransaction = new web3.Transaction()
		harvestTransaction.add(harvestInstruction)
		const harvestSignature = await transactionSender.send(connection, harvestTransaction)
		console.log('Harvest sig: ', harvestSignature);
	}
}

go()
