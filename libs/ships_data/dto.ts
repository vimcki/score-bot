import * as web3 from '@solana/web3.js';

export interface Ships{
	[key: string]: Ship
}

export interface Ship{
	symbol: string
	name: string
	mint_addr: web3.PublicKey
}
