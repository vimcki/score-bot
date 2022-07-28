import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import R4 from "./resource_calculator/r4/r4"
import {Resource} from "./resource_calculator/calc"
import Balance from "./balance"

import {scoreProgramID, foodMint, ammoMint, fuelMint, toolkitMint} from "./addresses"

import connection from "./rpc_connection/figment/figment"

require('dotenv').config();

const resourceCalc = new R4()
const publicKey = new web3.PublicKey(process.env.PUBLIC_KEY as string)

const balance = new Balance(publicKey)

async function go() {
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

	const fleets = await factory.getAllFleetsForUserPublicKey(connection, publicKey, scoreProgramID)
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
			publicKey,
		)

		const neededFoodPart = resourceCalc.resupply(Resource.Food, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededArmsPart = resourceCalc.resupply(Resource.Arms, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededFuelPart = resourceCalc.resupply(Resource.Fuel, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededToolkitsPart = resourceCalc.resupply(Resource.Toolkit, scoreVarsShipInfo, shipStakingAccountInfo)

		neededFood += neededFoodPart
		neededArms += neededArmsPart
		neededFuel += neededFuelPart
		neededToolkits += neededToolkitsPart

	}

	const multiplier = 1.05
	const missingFood = Math.max(neededFood - foodBalance, 0) * multiplier
	const missingArms = Math.max(neededArms - armsBalance, 0) * multiplier
	const missingFuel = Math.max(neededFuel - fuelBalance, 0) * multiplier
	const missingToolkits = Math.max(neededToolkits - toolkitBalance, 0) * multiplier

	console.log("food:", missingFood)
	console.log("arms", missingArms)
	console.log("fuel", missingFuel)
	console.log("toolkits", missingToolkits)

	process.exit()
}

go()
