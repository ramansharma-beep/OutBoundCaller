# Outbound Caller

A web-based dialer application that uses Twilio Voice to make outbound phone calls. Built with Node.js, Express, MySQL, Redis (call logs caching), JWT authentication, Socket.io for real-time updates, and vanilla JavaScript on the frontend.

## Features

- **User authentication** – Sign up, login, and JWT-protected sessions
- **Clean dialer interface** – Make outbound calls from the browser using Twilio Device
- **Hold / Unhold** – Put calls on hold and resume via Twilio conferences
- **End call** – Terminate active calls from the UI
- **Real-time call status** – Live updates (ringing, in-progress, completed) via Socket.io
- **Call logs** – Per-user call history stored in MySQL, cached with Redis (view and delete)
- **Responsive design** – Usable on mobile and desktop

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **MySQL** (for users and call logs)
- **Redis** (for call logs cache; e.g. [Redis Cloud](https://redis.com/try-free/) free tier)
- **Twilio account** with:
  - Account SID and Auth Token
  - A Twilio phone number
  - Twilio API Key (SID + Secret) for Voice SDK tokens
  - A TwiML App whose Voice URL points to your server’s agent-join endpoint
- **Public URL** for webhooks (e.g. ngrok in development) so Twilio can reach your server

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a MySQL database and run the schema:

```bash
mysql -u your_user -p < backend/database/schema.sql
```

Or run the contents of `backend/database/schema.sql` in your MySQL client. This creates the `outbound_caller` database and the `users` and `call_logs` tables.

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Twilio Voice SDK (browser) – create an API Key in Twilio Console
TWILIO_API_KEY_SID=your_api_key_sid_here
TWILIO_API_KEY_SECRET=your_api_key_secret_here

# TwiML App – create in Twilio Console and set Voice URL to:
# https://your-public-url/api/agent-join
TWILIO_TWIML_APP_SID=your_twiml_app_sid_here

# Public base URL for Twilio webhooks (e.g. https://xxxx.ngrok.io)
PUBLIC_WEBHOOK_URL=https://your-public-url

# Auth
JWT_SECRET=your_jwt_secret_here

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=outbound_caller
DB_PORT=3306

# Redis (call logs cache) – use the connection URL only (no "redis-cli -u" prefix)
# Example: Redis Cloud provides a URL like redis://default:password@host:port
REDIS_URL=redis://localhost:6379
```

**Getting Twilio credentials:**

1. Sign up at [Twilio](https://www.twilio.com/try-twilio) and open the [Twilio Console](https://console.twilio.com/).
2. **Account SID** and **Auth Token** are on the dashboard.
3. **Phone number**: Phone Numbers → Manage → Buy a number (or use a trial number).
4. **API Key**: Account → API keys & tokens → Create API Key; use the SID and Secret for `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET`.
5. **TwiML App**: Develop → TwiML Apps → Create. Set the Voice request URL to `https://YOUR_PUBLIC_WEBHOOK_URL/api/agent-join` (must be HTTPS and publicly reachable).

For local development, use [ngrok](https://ngrok.com/) (or similar) and set `PUBLIC_WEBHOOK_URL` to the ngrok HTTPS URL.

**Redis (call logs cache):** Set `REDIS_URL` to your Redis connection URL. Use only the URL (e.g. `redis://default:password@host:port`), not a shell command like `redis-cli -u ...`. Free tiers (e.g. [Redis Cloud](https://redis.com/try-free/)) work. If Redis is unavailable, the app will fail to start until `REDIS_URL` is valid.

### 4. Start the Server

```bash
npm start
```

The app runs at `http://localhost:3000` (or the `PORT` in `.env`).

### 5. Open the Application

1. Go to `http://localhost:3000` (or your configured port).
2. Sign up or log in.
3. Use the dialer to enter a number and make calls; use Hold/Unhold and End Call as needed. View history on the Call Logs page.

## Usage

1. **Sign up / Login** – Create an account or sign in. The dialer and call logs require authentication.
2. **Make a call** – Enter a phone number in E.164 format (e.g. `+1234567890`) and click **Make Call**. The browser uses the Twilio Voice SDK to place the call.
3. **Hold / Unhold** – During a call, use **Hold** and **Unhold** to put the far end on hold.
4. **End call** – Click **End Call** to hang up.
5. **Call logs** – Open **Call Logs** from the nav to see your call history and delete entries.

## Project Structure

```
outBoundCaller/
├── backend/
│   ├── server.js              # Express server, Socket.io, static files, API routes
│   ├── config/
│   │   ├── dbConfig.js        # MySQL connection pool
│   │   ├── redisConfig.js     # Redis client (call logs cache)
│   │   └── twilioConfig.js    # Twilio client
│   ├── controllers/
│   │   ├── authController.js  # Login, signup
│   │   ├── callController.js  # End call
│   │   ├── callStatusController.js  # Twilio status webhook, Socket.io, call logs
│   │   ├── callLogController.js     # Get/delete call logs (Redis cache)
│   │   ├── holdController.js  # Hold/unhold via conference
│   │   ├── tokenController.js # Twilio Voice access token
│   │   └── voiceController.js # TwiML: agent-join, call-events, dial-action
│   ├── middleware/
│   │   └── authMiddleWare.js  # JWT verification
│   ├── routes/
│   │   └── callRoutes.js      # API route definitions
│   ├── services/
│   │   └── callLogServices.js # Call log DB operations, cache invalidation
│   ├── store/
│   │   └── callState.js       # In-memory state for hold flow
│   └── database/
│       └── schema.sql        # MySQL schema (users, call_logs)
├── public/
│   ├── index.html            # Main dialer page
│   ├── login.html
│   ├── signup.html
│   ├── call-logs.html
│   ├── styles.css
│   ├── app.js                # Dialer, Device, hold/end, Socket.io
│   ├── auth.js               # Auth helpers, redirects
│   ├── login.js
│   ├── signup.js
│   └── call-logs.js
├── package.json
├── .env                      # Environment variables (do not commit)
└── README.md
```

## API Endpoints

**Public**

- `POST /api/login` – Login (body: `email`, `password`). Returns JWT and user info.
- `POST /api/signup` – Register (body: `name`, `email`, `password`).

**Protected (send `Authorization: Bearer <token>`)**

- `GET /api/getToken` – Returns a Twilio Voice access token for the browser Device.
- `POST /api/end-call` – End call (body: `callSid`).
- `GET /api/call-logs` – List call logs for the current user (cached in Redis, 5 min TTL).
- `DELETE /api/delete-call-log/:callSid` – Soft-delete a call log.
- `POST /api/hold-call` – Put the child call on hold (body: `parentCallSid`).
- `POST /api/unhold-call` – Resume from hold (body: `parentCallSid`).

**Twilio webhooks (called by Twilio, not by the frontend)**

- `POST /api/call-status/:userId` – Status callback for calls; updates call logs and emits to Socket.io.
- `POST /api/agent-join` – TwiML Voice URL; dials the number and wires up status/actions.
- `POST /api/call-events` – TwiML for conference (hold) flow.
- `POST /api/dial-action` – TwiML dial action (post-dial handling).

## Important Notes

- **Trial accounts** – Twilio trial accounts can only call verified numbers. Upgrade to call any number.
- **Phone format** – Use E.164 (e.g. `+1234567890`). The UI may help format, but the backend expects E.164.
- **Security** – Do not commit `.env`. It contains secrets (Twilio, JWT, DB). Keep `JWT_SECRET` strong and random.
- **Webhooks** – Twilio must reach your server over HTTPS. Use ngrok (or similar) in development and set `PUBLIC_WEBHOOK_URL` accordingly.
- **TwiML App** – The TwiML App’s Voice URL must point to your deployed `PUBLIC_WEBHOOK_URL` + `/api/agent-join`.

## Troubleshooting

**"Twilio credentials not configured" / "JWT_SECRET not configured"**  
- Ensure `.env` exists and has the required variables (no extra spaces or quotes).

**"Failed to get the token"**  
- Check `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, and `TWILIO_TWIML_APP_SID`. The TwiML App SID is from Develop → TwiML Apps, not the phone number SID.

**Call doesn’t connect or no audio**  
- Verify the Twilio number is active and the destination is valid (and verified if trial).
- Ensure `PUBLIC_WEBHOOK_URL` is correct and reachable by Twilio (HTTPS). Check Twilio debugger/logs for webhook errors.

**Database connection errors**  
- Confirm MySQL is running and `DB_*` in `.env` match your database. Run `backend/database/schema.sql` if tables are missing.

**"Invalid URL" / Redis connection errors**  
- Set `REDIS_URL` in `.env` to the Redis connection URL only (e.g. `redis://default:password@host:port`). Do not include `redis-cli -u` or any shell command. Ensure Redis (local or cloud) is reachable.

**Call status not updating in the UI**  
- Ensure the server is reachable at `PUBLIC_WEBHOOK_URL` so status webhooks succeed. Check that Socket.io is loading and the client is joining the call room (e.g. after ringing).
