import PriceModel from "../models/price.model.js";

export const savePrices = async (prices) => {
    try {
        if (!prices?.length) return 0;
        return await PriceModel.insertMany(prices, { ordered: false });
    } catch (error) {
        throw error;
    }
};

export const getPrices = async (payload) => {
    try {
        const { options, sort, limit } = payload;
        let query = PriceModel.find(options);
        if (sort) query = query.sort(sort);
        if (limit !== undefined && limit !== null) query = query.limit(limit);
        return await query;
    } catch (error) {
        throw error;
    }
}
