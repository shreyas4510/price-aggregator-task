import { getPrices, savePrices } from "../respositories/price.repository.js";
import logger from "../utils/logger.js";
import { fetchTickers, fetchTopCoins } from "./coingecko.service.js";

export const collectAndStorePrices = async () => {
    try {
        const top5Coins = await fetchTopCoins();
        const results = await Promise.allSettled(top5Coins.map(async (coinId) => {
            try {
                const tickers = await fetchTickers(coinId);
                const averagePrice = tickers.reduce((sum, t) => sum + t.price, 0) / tickers.length;
                return {
                    pair: `${coinId}-USDT`,
                    averagePrice,
                    exchanges: tickers,
                    timestamp: new Date()
                };
            } catch (err) {
                logger.error(`Failed to fetch/store price for ${coinId}: ${err.message}`);
                return null;
            }
        }));

        await savePrices(results.filter(r => r.status === "fulfilled").map(r => r.value));
        const failures = results.filter(r => r.status === "rejected");
        if (failures.length > 0) {
            logger.warn("Partial failures occurred", failures.map(f => f.reason.message));
        }
    } catch (err) {
        logger.error(`Error in collectAndStorePrices: ${err.message}`);
    }
}

export const getLatestPrices = async (pairs) => {
    try {
        if (!pairs?.length) return [];
        const result = await getPrices({
            options: { pair: { $in: pairs } },
            sort: { timestamp: -1 },
            limit: pairs.length
        });
        return result;
    } catch (err) {
        logger.error(`Error in getLatestPrices: ${err.message}`);
        throw err;
    }
}

export const getHistoricalPrices = async (pairs, from, to) => {
    try {
        const options = { pair: { $in: pairs } };
        if (from || to) options.timestamp = {};
        if (from) options.timestamp.$gte = new Date(from);
        if (to) options.timestamp.$lte = new Date(to);

        return await getPrices({ options, sort: { timestamp: -1 } });
    } catch (err) {
        logger.error(`Error in getHistoricalPrices: ${err.message}`);
        throw err;
    }
}
