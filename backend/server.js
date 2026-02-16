require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express(); 
const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set('io', io);

io.on('connection', (socket) =>{
    // console.log('A user connected');
      socket.on('join-call', ({callSid}) =>{
        if(callSid){
          console.log('A user joined the call', callSid);
            socket.join(callSid);
         }
      });
      socket.on('leave-call', ({ callSid }) => {
        if (callSid) {
          socket.leave(callSid);
          console.log('A user left the call', callSid);
        }
      });
})

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // to parse the body of the form data



const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath)); 


const callRoutes = require('./routes/callRoutes');

app.use('/api', callRoutes);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to configure your .env file with Twilio credentials');
});


