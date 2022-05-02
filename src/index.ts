import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./pkg/keypair/secret_key_file/keypair"
import AnyResource from "./instruction/any_resource/any"
import Harvest from "./instruction/harvest/harvest"
import TransactionSender from "./transaction_sender/basic/basic"
import R4 from "./resource_calculator/r4/r4"
import {Resource} from "./resource_calculator/calc"
import SerumMarket from "./market/market"
import Balance from "./balance"

import {scoreProgramID, atlasMint, foodMint, ammoMint, fuelMint, toolkitMint} from "./addresses"

import connection from "./rpc_connection/figment/figment"

require('dotenv').config();

const kpp = new KeypairProvider(process.env.KEY_PATH as string)
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
)

const armInsctructionProvider = new AnyResource(
	Resource.Arms,
	keypair.publicKey,
	scoreProgramID,
	ammoMint,
)

const fuelInstructionProvider = new AnyResource(
	Resource.Fuel,
	keypair.publicKey,
	scoreProgramID,
	fuelMint,
)

const repairInstructionProvider = new AnyResource(
	Resource.Toolkit,
	keypair.publicKey,
	scoreProgramID,
	toolkitMint,
)

const transactionSender = new TransactionSender(
	keypair
)

const market = new SerumMarket(transactionSender)

const balance = new Balance(keypair.publicKey)

async function go() {
	console.log("Starting score bot")

	console.log("getting food balance")
	const foodBalance = await balance.get(connection, foodMint)
	console.log("getting ammo balance")
	const armsBalance = await balance.get(connection, ammoMint)
	console.log("getting fuel balance")
	const fuelBalance = await balance.get(connection, fuelMint)
	console.log("getting toolkit balance")
	const toolkitBalance = await balance.get(connection, toolkitMint)

	let neededFood = 0
	let neededArms = 0
	let neededFuel = 0
	let neededToolkits = 0

	const fleets = await factory.getAllFleetsForUserPublicKey(connection, keypair.publicKey, scoreProgramID)
	let resupplyInstructions: web3.TransactionInstruction[] = []
	let harvestInstructions: web3.TransactionInstruction[] = []
	for (let fleet of fleets) {
		const shipMint = fleet.shipMint
		console.log('shipMint: ', shipMint.toJSON());
		console.log('getting scoreVarsShipInfo')
		const scoreVarsShipInfo = await factory.getScoreVarsShipInfo(connection, scoreProgramID, shipMint)
		console.log('getting shipStakingAccountInfo')
		const shipStakingAccountInfo = await factory.getShipStakingAccountInfo(
			connection,
			scoreProgramID,
			shipMint,
			keypair.publicKey,
		)

		const neededFoodPart = resourceCalc.resupply(Resource.Food, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededArmsPart = resourceCalc.resupply(Resource.Arms, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededFuelPart = resourceCalc.resupply(Resource.Fuel, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededToolkitsPart = resourceCalc.resupply(Resource.Toolkit, scoreVarsShipInfo, shipStakingAccountInfo)

		neededFood += neededFoodPart
		neededArms += neededArmsPart
		neededFuel += neededFuelPart
		neededToolkits += neededToolkitsPart

		console.log('getting feedInstruction')
		const feedInstruction = await feedInstructionProvider.get(connection, neededFoodPart, shipMint)
		console.log('getting armInsctruction')
		const armInstruction = await armInsctructionProvider.get(connection, neededArmsPart, shipMint)
		console.log('getting fuelInstruction')
		const fuelInstruction = await fuelInstructionProvider.get(connection, neededFuelPart, shipMint)
		console.log('getting repairInstruction')
		const repairInstruction = await repairInstructionProvider.get(connection, neededToolkitsPart, shipMint)
		console.log('getting harvestInstruction')
		const harvestInstruction = await harvestInstructionProvider.get(connection, shipMint)

		harvestInstructions.push(harvestInstruction)
		resupplyInstructions.push(feedInstruction, armInstruction, fuelInstruction, repairInstruction)
	}
	await executeInstructions(connection, harvestInstructions)

	const multiplier = 1.05
	const missingFood = Math.max(neededFood - foodBalance, 0) * multiplier
	const missingArms = Math.max(neededArms - armsBalance, 0) * multiplier
	const missingFuel = Math.max(neededFuel - fuelBalance, 0) * multiplier
	const missingToolkits = Math.max(neededToolkits - toolkitBalance, 0) * multiplier

	if (missingFood > 0) {
		console.log(`Buying ${missingFood} food`)
		await market.buy(connection, Resource.Food, missingFood, keypair)
	}
	if (missingArms > 0) {
		console.log(`Buying ${missingArms} arms`)
		await market.buy(connection, Resource.Arms, missingArms, keypair)
	}
	if (missingFuel > 0) {
		console.log(`Buying ${missingFuel} fuel`)
		await market.buy(connection, Resource.Fuel, missingFuel, keypair)
	}
	if (missingToolkits > 0) {
		console.log(`Buying ${missingToolkits} toolkits`)
		await market.buy(connection, Resource.Toolkit, missingToolkits, keypair)
	}
	await executeInstructions(connection, resupplyInstructions)

}

async function executeInstructions(connection: web3.Connection, instructions: web3.TransactionInstruction[]) {
	console.log(`Executing ${instructions.length} instructions`)
	while (instructions.length > 0) {
		console.log(instructions.length)
		const processedInsctructions = instructions.splice(0, 5)
		console.log(processedInsctructions.length)
		let transaction = new web3.Transaction()
		for (let instruction of processedInsctructions) {
			transaction.add(instruction)
		}
		const signature = await transactionSender.send(connection, transaction)
		console.log("transaction sig: ", signature)
	}
}

go()
