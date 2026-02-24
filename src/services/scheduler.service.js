import cron from "node-cron";
import env from "../config/env.js";
import { collectAndStorePrices } from "./price.service.js";
import logger from "../utils/logger.js";

export const startScheduler = () => {
  cron.schedule(`*/${env.SCHEDULER_INTERVAL_SECONDS} * * * * *`, async () => {
    logger.info("Running scheduled price collection");
    await collectAndStorePrices();
  });
};

export const runOnDemand = async () => {
  return collectAndStorePrices();
};
