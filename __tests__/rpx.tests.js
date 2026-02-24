import mongoose from "mongoose";
import crypto from "crypto";
import DHT from "hyperdht";
import RPC from "@hyperswarm/rpc";
import { MongoMemoryServer } from "mongodb-memory-server";

import Price from "../src/models/price.model.js";
import { registerRpcHandlers } from "../src/rpc/rpc.handlers.js";
import { jest } from "@jest/globals";

jest.setTimeout(30000);

let mongoServer;

let serverDht;
let clientDht;

let rpc;
let rpcServer;
let rpcClient;

let serverPublicKey;

beforeAll(async () => {
    // In-memory Mongo
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // DHT Setup
    serverDht = new DHT({ keyPair: DHT.keyPair(crypto.randomBytes(32)) });
    clientDht = new DHT({ keyPair: DHT.keyPair(crypto.randomBytes(32)) });

    await serverDht.ready();
    await clientDht.ready();

    // RPC Server
    rpc = new RPC({ dht: serverDht });
    rpcServer = rpc.createServer();

    registerRpcHandlers(rpcServer);
    await rpcServer.listen();

    serverPublicKey = rpcServer.publicKey;

    // RPC Client
    rpcClient = new RPC({ dht: clientDht });
});

afterAll(async () => {
    if (rpcServer) await rpcServer.close();
    if (rpc) await rpc.destroy();
    if (rpcClient) await rpcClient.destroy();

    if (serverDht) await serverDht.destroy();
    if (clientDht) await clientDht.destroy();

    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Price.deleteMany({});

    await Price.insertMany([
        {
            pair: "bitcoin-USDT",
            averagePrice: 60000,
            exchanges: [
                { name: "Binance", price: 60000 },
                { name: "Kraken", price: 60100 }
            ],
            timestamp: new Date("2026-01-01")
        },
        {
            pair: "ethereum-USDT",
            averagePrice: 3000,
            exchanges: [
                { name: "Binance", price: 3000 },
                { name: "Kraken", price: 2990 }
            ],
            timestamp: new Date("2025-12-02")
        },
        {
            pair: "ethereum-USDT",
            averagePrice: 3000,
            exchanges: [
                { name: "Binance", price: 3000 },
                { name: "Kraken", price: 2990 }
            ],
            timestamp: new Date("2025-12-03")
        }
    ]);
});

describe("Price aggregator E2E test cases", () => {

    //---------------- SUCCESS CASE ----------------
    test("getLatestPrices returns correct data", async () => {
        const client = rpcClient.connect(serverPublicKey);
        const response = await client.request(
            "getLatestPrices",
            Buffer.from(JSON.stringify({ pairs: ["bitcoin-USDT"] }))
        );

        const result = JSON.parse(response.toString());
        expect(result.length).toBe(1);
        expect(result[0].pair).toBe("bitcoin-USDT");

        client.end();
    });

    // ---------------- EMPTY RESULT ----------------
    test("returns empty array for unknown pair", async () => {
        const client = rpcClient.connect(serverPublicKey);

        const response = await client.request(
            "getLatestPrices",
            Buffer.from(JSON.stringify({ pairs: ["invalid-USDT"] }))
        );

        const result = JSON.parse(response.toString());

        expect(result).toEqual([]);

        client.end();
    });

    // ---------------- HISTORICAL SUCCESS ----------------
    test("getHistoricalPrices returns data within range", async () => {
        const client = rpcClient.connect(serverPublicKey);

        const response = await client.request(
            "getHistoricalPrices",
            Buffer.from(
                JSON.stringify({
                    pairs: ["bitcoin-USDT", "ethereum-USDT"],
                    from: new Date("2025-12-01").getTime(),
                    to: new Date("2025-12-31").getTime()
                })
            )
        );

        const result = JSON.parse(response.toString());
        expect(result.length).toBeGreaterThan(0);
        client.end();
    });

    // ---------------- INVALID PAYLOAD ----------------
    test("handles invalid JSON payload", async () => {
        const client = rpcClient.connect(serverPublicKey);
        await expect(
            client.request("getLatestPrices", Buffer.from("invalid-json"))
        ).rejects.toThrow();

        client.end();
    });

    // ---------------- INVALID DATE RANGE ----------------
    test("invalid date range returns empty result", async () => {
        const client = rpcClient.connect(serverPublicKey);
        const response = await client.request(
            "getHistoricalPrices",
            Buffer.from(
                JSON.stringify({
                    pairs: ["bitcoin-USDT"],
                    from: Date.now(),
                    to: Date.now() - 100000
                })
            )
        );

        const result = JSON.parse(response.toString());
        expect(result).toEqual([]);

        client.end();
    });

});
