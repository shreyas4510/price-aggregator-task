import axios from "axios";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const coinGeckoUrl = env.COINGECKO_BASE_URL;
export const fetchTopCoins = async () => {
    try {
        const { data } = await axios.get(
            `${coinGeckoUrl}/coins/markets`,
            {
                params: {
                    vs_currency: "usd",
                    order: "market_cap_desc",
                    per_page: 5,
                    page: 1
                }
            }
        );
        return data.map((coin) => coin.id);
    } catch (error) {
        logger.error(`Error fetching top coins: ${error.message}`);
        throw error;
    }
};

export const fetchTickers = async (coinId) => {
    try {
        const { data } = await axios.get(`${coinGeckoUrl}/coins/${coinId}/tickers`);
        const validTickers = data.tickers
            .filter(t => (
                t.target === "USDT" &&
                typeof t.last === "number" &&
                t.last > 0
            ))
            .slice(0, 3);

        if (validTickers.length === 0) {
            throw new Error("No valid exchanges");
        }

        return validTickers.map(t => ({
            name: t.market.name,
            price: t.last
        }));
    } catch (error) {
        logger.error(`Error fetching tickers for ${coinId}: ${err.message}`);
        throw error;
    }
};