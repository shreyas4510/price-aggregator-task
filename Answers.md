## Q1 — MongoDB Schema Design

For storing the price data, the schema I chose contains:

* `pair`
* `averagePrice`
* `exchanges` (which were used to calculate the average)
* `timestamp`

I designed it this way because this is the only information required as per the task. The CoinGecko API gives a lot of data, but we only need the aggregated price, the exchanges used for that aggregation, historical data, and the latest prices. So this structure was enough for our use case.

Since the scheduler runs every 30 seconds, data will keep increasing continuously. So I made sure to store only the minimum required fields to avoid storing unnecessary data.

In terms of trade-offs, the first thing I considered was document size. Because the data will grow frequently, storing only essential information helps keep the documents small.

The second thing was indexing. I added an index on the `pair` field because most of the queries, whether for latest prices or historical data, will be based on trading pairs. So indexing `pair` helps in improving query performance.

These were the main points I considered while designing the schema.

--------------------------------
## Q2 — Scheduling Approach

For scheduling the pipeline, I used a cron job (node-cron). I chose cron instead of setInterval because cron gives better control over how frequently tasks are executed. It is more structured and easier to manage when working with time-based jobs.

setInterval is simpler, but if the task takes longer than the interval, it can cause overlapping executions. With cron, it is easier to manage and control such behavior properly.

If this system needs to run across multiple instances, I would not let every instance run its own cron job, because that can lead to duplicate executions. In that case, I would move the scheduler to a separate dedicated service or use a centralized job system, so only one instance runs the scheduled task. This avoids duplicate processing and keeps the system clean.

-----------------------------------------

## Q3 — Data Quality & Edge Cases

While working on this task, I encountered a few data quality issues.

One issue was stale data. Sometimes the data returned by the API could be older than expected. Since this system requires relatively fresh data, I initially tried to implement a maximum stale time of one minute. If the last updated time was older than that, it would skip that record. However, since the API was in testing mode, it was not returning valid records consistently, so I had to remove that logic for now.

Another issue I considered was invalid or garbage data. To handle this, I added checks to make sure that the incoming price value is a number and greater than zero before using it in the aggregation. This avoids storing incorrect values in the database.

I also encountered issues with invalid input from the client side while writing test cases. For example, instead of sending `pairs` as an array, I mistakenly sent it as a string. I added proper validation to ensure that `pairs` must be an array before processing the request.

Another case was hitting the CoinGecko API too many times, which triggered their rate limiter. In those situations, the pipeline execution would fail for that cycle, but it would not insert partial or invalid data into the database. The system would remain in its previous state and try again in the next scheduled run after 30 seconds.

These were the main data quality and edge cases I encountered and handled during development.

-----------------------

## Q4 — Hyperswarm RPC - Optional

Before this task, I had not used Hyperswarm RPC or any Holepunch libraries in a real project. I have mainly worked with Kafka for distributed communication, and for one of my hobby projects, I used gRPC. In some ways, the concept felt similar, where functions are exposed on the server side and called from the client side.

To learn Hyperswarm RPC, I started by reading the official documentation. I first tried to understand what it is used for and how the basic setup works. Since I already have experience building servers using gRPC, I approached it by comparing how communication happens between client and server in those systems versus how it works in Hyperswarm. While developing the project, I learned it step by step and integrated it gradually.

Nothing was very surprising, because at a high level, it still follows the idea of calling functions remotely from the client. However, one area where I would do more research next time is around bootstrap configuration. Initially, I tried adding host and port based on the documentation, but it was breaking the connection. Later, I simplified it by using only the key pair and removing the bootstrap configuration due to time constraint.

Next time, I would spend more time understanding the networking and DHT setup in more depth, so the architecture can be more robust and better configured.

--------------------

## Q5 — Testing Strategy

For testing, I used Jest. The main reason was that I am already familiar with it and have worked with it recently. I also know Supertest and Mocha, but I would have needed some time to refresh those, and since time was limited, I preferred to use a tool I was comfortable with.

I prioritised testing the main RPC APIs. For each API, I covered the success case, invalid input cases, and empty result cases. For example, I tested what happens when pairs is sent in the wrong format, or when a non-existing pair is requested. This was important to ensure the system handles errors properly and does not crash.

Since the time was limited, I added one main test case per API to show the overall testing approach. If I had more time, I would add more detailed test cases, such as testing database failures and covering more edge cases. I would also separate unit tests and integration tests properly, so that individual functions and the full flow are both tested more thoroughly.

-----------------

## Q6 — Production Readiness

If this service needs to go to production, there are several improvements I would make.

First, I would improve logging. More structured logging should be added at important points, especially around scheduler execution, RPC calls, and database operations. This would help in debugging and tracing issues in production.

Second, proper centralized error handling should be implemented. Right now, error handling is basic. In production, there should be a consistent error handling strategy so that errors are logged properly and do not crash the system.

Monitoring tools should also be added. For example, application metrics and health checks can be monitored to detect failures early.

From a deployment perspective, the service should be containerized using Docker. A proper CI/CD pipeline should also be added to automate testing and deployment.

On the security side, input validation and sanitization should be enforced strictly. Authentication and authorization can be added so that only authorized clients can access the RPC methods. Rate limiting should also be added to prevent abuse. Audit logging should be implemented to track important actions and requests.

For scaling, if traffic increases, we can use auto-scaling with Kubernetes or cloud auto-scaling groups. Since the scheduler runs every 30 seconds and data keeps increasing, the database should also be monitored closely. In the future, sharding can be considered if the dataset grows significantly to maintain performance.

These are the main improvements I would focus on for making the service production-ready.

--------------------------

## Q7 — Dependencies & Tooling

Here are the main npm packages I used beyond the required ones:

Axios
I used Axios for calling the CoinGecko API. I prefer Axios over the native fetch because the syntax is cleaner and easier to manage. Error handling and timeouts are also easier to configure in Axios. It felt more straightforward and maintainable for this use case.

crypto
I used the built-in crypto module to generate a unique key pair for the RPC server. It is reliable and part of Node.js itself, so no extra dependency was needed.

Joi
I used Joi mainly for environment variable validation. I initially planned to use it for input validation as well. I chose Joi because it is simple to use and I am comfortable with it. Alternatives like Zod are also good, but Joi was quicker for me to implement.

Mongoose
I used Mongoose as an ODM for MongoDB. It makes schema definition and validation easier compared to writing raw MongoDB queries. It also helps structure the data properly and manage models in a cleaner way. Compared to using the native Mongo driver directly, Mongoose made development faster and more organized.

node-cron
I used node-cron for scheduling instead of setInterval. It is more structured and easier to manage for time-based jobs. It also avoids some timing issues that can happen with setInterval if execution takes longer than expected.

Pino
I used Pino for logging. I have used other loggers like Winston before, but Pino is lightweight and fast, and the configuration is simple. Since time was limited, I chose something that was easy to integrate quickly.

Jest
For testing, I used Jest because I am already familiar with it and have worked with it recently. Instead of spending time refreshing other tools like Mocha or Supertest, I used Jest to move faster and focus on writing meaningful test cases.

Overall, most of the tooling choices were based on familiarity, simplicity, and time constraints, while still keeping the structure clean and maintainable.