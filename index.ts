import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./libs/pkg/keypair/secret_key_file/keypair"
import AnyResource from "./libs/instruction/any_resource/any"
import Harvest from "./libs/instruction/harvest/harvest"
import TransactionSender from "./libs/transaction_sender/basic/basic"
import R4 from "./libs/resource_calculator/r4/r4"
import {Resource} from "./libs/resource_calculator/calc"

//import Puller from "./libs/ships_data/puller/http_get/get"
import connection from "./libs/rpc_connection/figment/figment"
//const ships_puller = new Puller("https://galaxy.staratlas.com/nfts")

const atlasMint = new web3.PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx")
const scoreProgramID = new web3.PublicKey("FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW")
const foodMint = new web3.PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG")
const ammoMint = new web3.PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK")
const fuelMint = new web3.PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim")
const toolkitMint = new web3.PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL")

const kpp = new KeypairProvider("/home/user/.config/solana/bank.json")
const keypair = kpp.get()

const resourceCalc = new R4()

const harvestInstructionProvider = new Harvest(
	keypair.publicKey,
	scoreProgramID,
	atlasMint,
)

const feedInstructionProvider = new AnyResource(
	Resource.Food, 
	keypair.publicKey,
	scoreProgramID,
	foodMint,
	resourceCalc,
)

const armInsctructionProvider = new AnyResource(
	Resource.Arms,
	keypair.publicKey,
	scoreProgramID,
	ammoMint,
	resourceCalc,
)

const fuelInstructionProvider = new AnyResource(
	Resource.Fuel,
	keypair.publicKey,
	scoreProgramID,
	fuelMint,
	resourceCalc,
)

const repairInstructionProvider = new AnyResource(
	Resource.Toolkit,
	keypair.publicKey,
	scoreProgramID,
	toolkitMint,
	resourceCalc,
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
		const feedInstruction = await feedInstructionProvider.get(connection, shipMint)
		const armInstruction = await armInsctructionProvider.get(connection, shipMint)
		const fuelInstruction = await fuelInstructionProvider.get(connection, shipMint)
		const repairInstruction = await repairInstructionProvider.get(connection, shipMint)
		const harvestInstruction = await harvestInstructionProvider.get(connection, shipMint)
		let transaction = new web3.Transaction()
		transaction.add(feedInstruction)
		transaction.add(armInstruction)
		transaction.add(fuelInstruction)
		transaction.add(repairInstruction)
		transaction.add(harvestInstruction)
		const signature = await transactionSender.send(connection, transaction)
		console.log("transaction sig: " ,signature)
	}
}

go()
