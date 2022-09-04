import express from 'express';
import httpImport from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

// set server config
var app = express();
app.use(cors());
var http = httpImport.createServer(app);

var io = new Server(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    handlePreflightRequest: (req, res) => {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': req.headers.origin,
            'Access-Control-Allow-Credentials': true,
        };
        res.writeHead(200, headers);
        res.end();
    }
});

// essentials
const __dirname = path.resolve();
const port = 8120;

// Setup files to be sent on connection
const filePath = "/public", appFile = "app.html";

// variables
var superRes = {};
var screenNumber = 1;
var activeScreens = 0;
var myArgs = process.argv.slice(2); // get nScreens input 
var nScreens = Number(myArgs[0]);

// start config
if (myArgs.length == 0 || isNaN(nScreens)) {
    console.log("Number of screens invalid or not informed, default number is 5.");
    nScreens = 5;
}
console.log(`Running LQ Space Chess for Liquid Galaxy with ${nScreens} screens!`);

// establish default dir
app.use(express.static(__dirname + filePath));


// show current tunnel url (for users)
app.get('/', (req, res) => {
    res.send(`
        <body style="background-color: black;">
            <h1 style="font-family: Sans-serif; color: white;">
                ENTER A NUMBER URL/NUMBER
            </h1>
        </body>
        `);
});

app.get('/:id', (req, res) => {
    // get inurl parameter (screen number)
    const id = req.params.id

    if (id <= nScreens) { // if the number is valid
        screenNumber = id
        res.sendFile(__dirname + `${filePath}/${appFile}`);
    } else { // if the number is invalid, notify screen
        res.send(`
        <body style="background-color: black;">
            <h1 style="font-family: Sans-serif; color: white;">
                make sure that npm start SCREENUM is properly set
            </h1>
        </body>
        `);
    }
    
});

io.on('connect', socket => {

    console.log(`User connected with id ${socket.id}`);

    /**
     * @description Create rooms: in this template there is only one (Screens) but you can have other like
     *              controller, etc...
     */
    socket.join('screen');
    
    /**
     * @description send screen id to the new screen (config)
     *              if you have multiple rooms you must take care of the type
     *              this code only applies for the screens.
     *              Imagine you have Screen, Controller and mobile.
     *              then you should check if that socket is a screen
     */
    io.to(socket.id).emit('update', {
        id: screenNumber
    });
    

    /**
     * @description get window size data of each screen
     */
    socket.on('windowSize', (data) => {
        superRes[data.id] = data.width;
        activeScreens++;

        // if all screens are connected
        if (activeScreens == nScreens) {
            let r = 0;
            let pos = []

            Object.entries(superRes).forEach(res => {
                console.log('res: ' + res[1]);
                r += res[1];
            });

            console.log('sending start signal');

            io.to('screen').emit('start', {
                width: r,
                height: 0,
                child: superRes
            });

            // reset active screen
            activeScreens = 0;
        }
    });

    /**
     * @EXAMPLE it is use in the example code
     * @description update mouse position in the slaves
     */
    socket.on('updateMousePos', (coords) => {
        socket.to('screen').emit('updateMouseSlaves', coords);
    });
});

// start server on the established port
http.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
});