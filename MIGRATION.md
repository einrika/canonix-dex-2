# Migration from Netlify Functions to Node.js (Express)

This document outlines the changes made to migrate the project from Netlify Functions to a standalone Node.js server using Express.

## Project Structure

The new structure is designed to be scalable and clean:

```
.
├── server.js (Main entry point)
├── src/
│   ├── controllers/ (Logic from Netlify Functions)
│   │   ├── prc20/
│   │   └── ...
│   ├── routes/ (Express route definitions)
│   └── utils/ (Shared utilities)
├── public/ (Static assets)
└── package.json
```

## Lifecycle Differences

### Serverless (Netlify Functions)
- **Stateless**: Each function invocation is independent. While some "warm" state might persist between requests if the instance is reused, it is not guaranteed.
- **Event-Driven**: Functions are triggered by HTTP events and have a defined execution limit (e.g., 10-26 seconds).
- **Auto-scaling**: Managed by the cloud provider (AWS Lambda under the hood for Netlify).
- **Cold Starts**: Initial requests might be slower due to environment initialization.

### Node.js Server (Express)
- **Stateful**: The server process stays running. In-memory variables (like `adminState` or `cache` in this project) persist across all requests as long as the server is alive.
- **Continuous**: The server is always listening for requests. Long-running tasks or WebSocket connections are possible.
- **Manual Scaling**: You are responsible for scaling (e.g., using PM2, Docker, or K8s).
- **No Cold Starts**: Once the server is started, it responds immediately.

## Code Conversion Example

### Before (Netlify Function)
```javascript
// netlify/functions/token-list.js
exports.handler = async (event) => {
    const { query } = event.queryStringParameters || {};
    // ... logic ...
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, data: result })
    };
};
```

### After (Express Controller)
```javascript
// src/controllers/token-list.js
const tokenListHandler = async (req, res) => {
    const { query } = req.query || {};
    // ... logic ...
    return res.status(200).json({ success: true, data: result });
};
module.exports = tokenListHandler;
```

## How to Run

To start the server:
```bash
node server.js
```
The server will be available at `http://localhost:3000`.
API endpoints are prefixed with `/api` (e.g., `/api/token-list`).
