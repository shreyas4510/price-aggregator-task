# Price Aggregation Service

A distributed cryptocurrency price aggregation service built with:

-   Node.js
-   MongoDB
-   HyperDHT
-   @hyperswarm/rpc

The service collects cryptocurrency prices from CoinGecko, stores
aggregated results in MongoDB, and exposes the data via RPC methods over
Hyperswarm.

------------------------------------------------------------------------

## Prerequisites

Before running the application, ensure you have:

-   Node.js (v18+ recommended)
-   MongoDB (local or remote instance running)

Verify installation:

    node -v
    npm -v

------------------------------------------------------------------------

## Getting Started

### 1. Clone the Repository

    git clone https://github.com/shreyas4510/price-aggregator-task
    cd price-aggregator-task

------------------------------------------------------------------------

### 2. Install Dependencies

    npm install

This installs all required dependencies for both the server and client.

------------------------------------------------------------------------

### 3. Configure Environment Variables

An `env.example` file is provided in the repository.

Create a `.env` file in the root directory:

    cp env.example .env


------------------------------------------------------------------------

## Running the Application

### 4. Start the Server

    npm run serve

This will:

-   Connect to MongoDB
-   Start the HyperDHT node
-   Start the RPC server
-   Start the scheduler for periodic data collection

After startup, the console will print a message similar to:

    RPC server started { publicKey: <HEX_PUBLIC_KEY> }

------------------------------------------------------------------------

### Important: Copy the Public Key

The server generates a unique public key (hex string).

Example:

    publicKey: a1b2c3d4e5f6....

Copy this public key.\
It is required for the client to connect to the RPC server.

------------------------------------------------------------------------

## Running the Client

### 5. Update the Client Public Key

Open the client file and go to:

    client.js (Line 10)

You will see a dummy public key.

Replace it with the public key printed by the server:

    const SERVER_PUBLIC_KEY = Buffer.from("PASTE_SERVER_PUBLIC_KEY_HERE", "hex");

Save the file.

------------------------------------------------------------------------

### 6. Run the Client

    npm run client

The client will automatically execute:

-   runOnDemand
-   getLatestPrices
-   getHistoricalPrices

All three RPC methods will be triggered sequentially, and results will
be displayed in the console.

------------------------------------------------------------------------

## Available RPC Methods

### 1. runOnDemand

Triggers the scheduler manually.

Returns:

    {
      "message": "Scheduler task executed on demand"
    }

------------------------------------------------------------------------

### 2. getLatestPrices

Request format:

    {
      "pairs": ["bitcoin-USDT"]
    }

Returns the most recent stored prices for the specified trading pairs.

------------------------------------------------------------------------

### 3. getHistoricalPrices

Request format:

    {
      "pairs": ["bitcoin-USDT"],
      "from": new Date('2026-02-24T10:24:00.000+00:00').getTime(),
	  "to": new Date('2026-02-24T10:32:00.000+00:00').getTime()
    }

Returns price records within the specified time range.

------------------------------------------------------------------------

## Application Flow

1.  Server starts
2.  MongoDB connection is established
3.  HyperDHT node initializes
4.  RPC server begins listening
5.  Scheduler starts periodic data collection
6.  Public key is generated for client connection
7.  Client connects using the public key
8.  RPC requests are executed

------------------------------------------------------------------------

## Graceful Shutdown

To stop the server safely:

    Ctrl + C

The application will:

-   Close RPC server
-   Destroy DHT node
-   Disconnect MongoDB
-   Exit gracefully
