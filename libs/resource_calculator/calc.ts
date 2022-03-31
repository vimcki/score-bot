var factory = require("@staratlas/factory")

export enum Resource {
	Food = 1,
	Arms,
	Fuel,
	Toolkit,
}

export interface ResourceCalculator{
	resupply(resource: Resource, shipScoreVars: factory.ScoreVarsShipInfo, shipStakingInfo: factory.ShipStakingInfo): number
}
