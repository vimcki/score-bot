import * as web3 from '@solana/web3.js';

export interface VarsShip {
    shipMint: web3.PublicKey;
    rewardRatePerSecond: number;
    fuelMaxReserve: number;
    foodMaxReserve: number;
    armsMaxReserve: number;
    toolkitMaxReserve: number;
    millisecondsToBurnOneFuel: number;
    millisecondsToBurnOneFood: number;
    millisecondsToBurnOneArms: number;
    millisecondsToBurnOneToolkit: number;
}

export interface StakingInfo {
    owner: web3.PublicKey;
    factionId: number;
    shipMint: web3.PublicKey;
    shipQuantityInEscrow: number;
    fuelQuantityInEscrow: number;
    foodQuantityInEscrow: number;
    armsQuantityInEscrow: number;
    fuelCurrentCapacity: number;
    foodCurrentCapacity: number;
    armsCurrentCapacity: number;
    healthCurrentCapacity: number;
    stakedAtTimestamp: number;
    fueledAtTimestamp: number;
    fedAtTimestamp: number;
    armedAtTimestamp: number;
    repairedAtTimestamp: number;
    currentCapacityTimestamp: number;
    totalTimeStaked: number;
    stakedTimePaid: number;
    pendingRewards: number;
    totalRewardsPaid: number;
}
export enum Resource {
	Food = 1,
	Arms,
	Fuel,
	Toolkit,
}

export interface ResourceCalculator{
	resupply(resource: Resource, shipScoreVars: VarsShip, shipStakingInfo: StakingInfo): number
}
