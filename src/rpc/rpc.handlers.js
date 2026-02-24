import { runOnDemand } from "../services/scheduler.service.js";
import { getHistoricalPrices, getLatestPrices } from "../services/price.service.js";
import CustomError from "../utils/error.js";
export const registerRpcHandlers = (server) => {
    server.respond("runOnDemand", async () => {
        await runOnDemand();
        return Buffer.from(JSON.stringify({ message: "Scheduler task executed on demand" }));
    });

    server.respond("getLatestPrices", async (payload) => {
        try {
            let parsed;
            try {
                parsed = JSON.parse(payload.toString());
            } catch (err) {
                throw CustomError("Invalid JSON payload");
            }

            const result = await getLatestPrices(parsed.pairs);
            return Buffer.from(JSON.stringify(result));
        } catch (error) {
            throw CustomError(error.message);
        }
    });

    server.respond("getHistoricalPrices", async (payload) => {
        try {
            let parsed;
            try {
                parsed = JSON.parse(payload.toString());
            } catch (error) {
                throw CustomError("Invalid JSON payload");
            }

            const { pairs, from, to } = parsed;
            const result = await getHistoricalPrices(pairs, from, to);
            return Buffer.from(JSON.stringify(result));
        } catch (error) {
            throw CustomError(error.message);
        }
    });
};
