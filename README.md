# Outbound Caller

A simple web-based dialer application that uses Twilio to make outbound phone calls. Built with Node.js, Express, and vanilla JavaScript.

## Features

- Clean, modern dialer interface
- Make outbound calls to any phone number
- End calls in progress
- Real-time call status updates
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Twilio account with:
  - Account SID
  - Auth Token
  - A verified Twilio phone number

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Twilio Credentials

Create a `.env` file in the root directory with your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
PORT=3000
```

**How to get your Twilio credentials:**

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio) if you don't have one
2. Log in to the [Twilio Console](https://console.twilio.com/)
3. Find your **Account SID** and **Auth Token** on the dashboard
4. Go to **Phone Numbers** > **Manage** > **Buy a number** to purchase a phone number (or use a trial number)
5. Copy your phone number in E.164 format (e.g., +1234567890)

### 3. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### 4. Open the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Enter a phone number in the input field (with or without formatting)
2. Click **"Make Call"** to initiate the call
3. The call status will be displayed in real-time
4. Click **"End Call"** to terminate an active call

## Project Structure

```
outBoundCaller/
├── server.js              # Express server with Twilio API endpoints
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables (not in git)
├── .gitignore            # Git ignore file
├── public/
│   ├── index.html        # Main dialer interface
│   ├── styles.css        # Styling for the dialer
│   └── app.js            # Frontend JavaScript logic
└── README.md             # This file
```

## API Endpoints

- `POST /api/make-call` - Initiates a new call
  - Body: `{ "phoneNumber": "+1234567890" }`
  - Returns: `{ "success": true, "callSid": "...", "status": "..." }`

- `POST /api/end-call` - Ends an active call
  - Body: `{ "callSid": "..." }`
  - Returns: `{ "success": true, "status": "completed" }`

- `GET /api/call-status/:callSid` - Gets the status of a call
  - Returns: `{ "sid": "...", "status": "...", "to": "...", "from": "..." }`

## Important Notes

- **Trial Accounts**: If you're using a Twilio trial account, you can only call verified phone numbers. Upgrade your account to call any number.
- **Phone Number Format**: Phone numbers should be in E.164 format (e.g., +1234567890). The application will attempt to format numbers automatically.
- **Security**: Never commit your `.env` file to version control. It contains sensitive credentials.
- **Call URL**: The current implementation uses Twilio's demo voice URL. For production, you'll want to create your own TwiML endpoint.

## Troubleshooting

**Error: "Twilio credentials not configured"**
- Make sure your `.env` file exists and contains all required variables
- Verify that your credentials are correct (no extra spaces or quotes)

**Error: "Failed to make call"**
- Check that your Twilio account has sufficient balance
- Verify that the phone number format is correct
- If using a trial account, ensure the destination number is verified

**Call doesn't connect**
- Verify your Twilio phone number is active
- Check that the destination number is valid
- Review Twilio console logs for detailed error messages

## License

ISC

