import PriceModel from "../model/price.model.js";

export const savePrices = async (prices) => {
    try {
        if (!prices?.length) return 0;
        return await PriceModel.insertMany(prices, { ordered: false });
    } catch (error) {
        throw error;
    }
};
