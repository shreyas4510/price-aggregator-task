import mongoose from "mongoose";
import crypto from "crypto";
import DHT from "hyperdht";
import RPC from "@hyperswarm/rpc";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { startScheduler } from "../services/scheduler.service.js";
import { registerRpcHandlers } from "./rpc.handlers.js";

let dht;
let rpc;
let rpcServer;

async function connectDatabase() {
    try {
        await mongoose.connect(env.MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000
        });

        logger.info("MongoDB connected");
    } catch (error) {
        logger.fatal({ error: error.message }, "MongoDB connection failed");
        process.exit(1);
    }
}

async function startRpcServer() {
    try {
        dht = new DHT({ keyPair: DHT.keyPair(crypto.randomBytes(32)) });
        await dht.ready();
        logger.info("DHT node ready");

        rpc = new RPC({ dht });
        rpcServer = rpc.createServer();
        await rpcServer.listen();
        logger.info({ publicKey: rpcServer.publicKey.toString("hex") }, "RPC server started");

        registerRpcHandlers(rpcServer);
    } catch (error) {
        logger.fatal({ error: error.message }, "Failed to start RPC server");
        process.exit(1);
    }
}

async function bootstrap() {
    await connectDatabase();
    await startRpcServer();

    startScheduler();
    logger.info("Scheduler started");
}

async function gracefulShutdown() {
    logger.info("Shutting down application...");

    try {
        if (rpcServer) await rpcServer.close();
        if (rpc) await rpc.destroy();
        if (dht) await dht.destroy();

        await mongoose.disconnect();

        logger.info("Shutdown complete");
        process.exit(0);
    } catch (error) {
        logger.error({ error: error.message }, "Error during shutdown");
        process.exit(1);
    }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    logger.fatal({ error: error.message }, "Uncaught exception");
    process.exit(1);
});

bootstrap();