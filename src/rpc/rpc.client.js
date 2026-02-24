import DHT from "hyperdht";
import RPC from "@hyperswarm/rpc";
import crypto from "crypto";
import logger from "../utils/logger.js";

async function startClient() {
	try {
		// Replace with the publicKey printed by your server
		const SERVER_PUBLIC_KEY = Buffer.from(
			'da3036d0053183159dd74117f51c55a57da6e8373785949495dc5e58b8ecc329',
			"hex"
		);

		const dht = new DHT({ keyPair: DHT.keyPair(crypto.randomBytes(32)) });
		await dht.ready();
		logger.info("DHT node ready");

		const rpc = new RPC({ dht });
		const client = rpc.connect(SERVER_PUBLIC_KEY);
		console.log("Connected to RPC server");

		// ------------------------------- REQUEST ON DEMAND CALL -------------------------------
		const onDemandResult = await client.request(
			"runOnDemand",
			Buffer.from(JSON.stringify({}))
		);
		logger.info(JSON.parse(onDemandResult.toString()));
		// ----------------------------------------------------------------------------------------

		const pairs = ['bitcoin-USDT', 'ethereum-USDT'];
		// -------------------------------- GET LATEST PRICES CALL --------------------------------
		const latesetPrices = await client.request(
			"getLatestPrices",
			Buffer.from(JSON.stringify({ pairs }))
		);

		logger.info(JSON.parse(latesetPrices.toString()));
		// ----------------------------------------------------------------------------------------

		// -------------------------------- GET HISTORICAL PRICES CALL --------------------------------
		const historicalPrices = await client.request(
			"getHistoricalPrices",
			Buffer.from(JSON.stringify({
				pairs,
				from: new Date('2026-02-24T10:24:00.000+00:00').getTime(),
				to: new Date('2026-02-24T10:32:00.000+00:00').getTime()
			}))
		);

		logger.info(JSON.parse(historicalPrices.toString()));
		// ----------------------------------------------------------------------------------------

		await rpc.destroy();
		await dht.destroy();

		process.exit(0);
	} catch (error) {
		console.log(error);

		console.error("RPC Client Error:", error.message);
		process.exit(1);
	}
}

startClient();