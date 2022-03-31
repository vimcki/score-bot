import * as factory from "@staratlas/factory"
var factory = require("@staratlas/factory")

import {Resource} from "./../calc"

interface Args{
	shipsNumber: number
	currentCapacityTimestamp: number
	resourceCurrentCapacity: number
	millisecondsToBurnOneResource: number
	resourceMaxReserve: number
}

export default class R4{
	resupply(resource: Resource, shipScoreVars: factory.ScoreVarsShipInfo, shipStakingInfo: factory.ShipStakingInfo): number{
		let resourceCurrentCapacity: number
		let millisecondsToBurnOneResource: number
		let resourceMaxReserve: number
		switch(resource){
			case Resource.Food: {
				resourceCurrentCapacity = shipStakingInfo.foodCurrentCapacity
				millisecondsToBurnOneResource = shipScoreVars.millisecondsToBurnOneFood
				resourceMaxReserve = shipScoreVars.foodMaxReserve
				break
			}
			case Resource.Arms: {
				resourceCurrentCapacity = shipStakingInfo.armsCurrentCapacity
				millisecondsToBurnOneResource = shipScoreVars.millisecondsToBurnOneArms
				resourceMaxReserve = shipScoreVars.armsMaxReserve
				break
			}
			case Resource.Fuel: {
				resourceCurrentCapacity = shipStakingInfo.fuelCurrentCapacity
				millisecondsToBurnOneResource = shipScoreVars.millisecondsToBurnOneFuel
				resourceMaxReserve = shipScoreVars.fuelMaxReserve
				break
			}
			case Resource.Toolkit: {
				resourceCurrentCapacity = shipStakingInfo.healthCurrentCapacity
				millisecondsToBurnOneResource = shipScoreVars.millisecondsToBurnOneToolkit
				resourceMaxReserve = shipScoreVars.toolkitMaxReserve
				break
			}
			default: {
				throw new Error("not supported resource")
			}
		}
		let args: Args = {
			shipsNumber: shipStakingInfo.shipQuantityInEscrow,
			currentCapacityTimestamp: shipStakingInfo.currentCapacityTimestamp,
			resourceCurrentCapacity: resourceCurrentCapacity,
			millisecondsToBurnOneResource: millisecondsToBurnOneResource,
			resourceMaxReserve: resourceMaxReserve,
		}
		
		return this.calculate(args)
	}
	calculate(args:Args):number{
		let now = Date.now()/1000
		const resourcePercentageMissing = (now-args.currentCapacityTimestamp)/args.resourceCurrentCapacity
		const resourcePercentageLeft = 1-resourcePercentageMissing
		const resourcePerSecond = args.millisecondsToBurnOneResource/1000
		const resourceAfterFeeding = args.resourceCurrentCapacity/resourcePerSecond
		const resourceLeft = resourcePercentageLeft*resourceAfterFeeding
		let resourceToFeed = args.shipsNumber * (args.resourceMaxReserve - resourceLeft)
		if (resourceToFeed < 1){
			resourceToFeed = 1
		}
		if (resourceToFeed > args.shipsNumber * args.resourceMaxReserve ){
			resourceToFeed = args.shipsNumber * args.resourceMaxReserve
		}
		return resourceToFeed
	}
}
