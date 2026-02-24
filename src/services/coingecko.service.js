import axios from "axios";
import env from "../config/env.js";
import ApiError, { STATUS_CODE } from "../utils/error.js";
import logger from "../utils/logger.js";

const client = env.COINGECKO_BASE_URL;
export const fetchTopCoins = async () => {
    try {
        const { data } = await axios.get(
            `${client}/coins/markets`,
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
    } catch (err) {
        logger.error(`Error fetching top coins: ${err.message}`);
        throw new ApiError(STATUS_CODE.INTERNAL_SERVER_ERROR, "Failed to fetch top coins");
    }
};

export const fetchTickers = async (coinId) => {
    try {
        const { data } = await axios.get(`${client}/coins/${coinId}/tickers`);

        const validTickers = data.tickers
            .filter(t => t.target === "USDT")
            .slice(0, 3);

        if (validTickers.length === 0) {
            throw new Error("No valid exchanges");
        }

        return validTickers.map(t => ({
            name: t.market.name,
            price: t.last
        }));
    } catch (err) {
        logger.error(`Error fetching tickers for ${coinId}: ${err.message}`);
        throw new ApiError(STATUS_CODE.INTERNAL_SERVER_ERROR, `Failed to fetch tickers for ${coinId}`);
    }
};