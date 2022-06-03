const HTTPSPORT = 3100
const HTTPPORT = 3200
const HOST = '0.0.0.0'

const express = require('express')
const cors = require('cors')
let fs = require('fs');
const helmet = require("helmet");
const cookieParser = require('cookie-parser')
// const csurf = require('csurf')
let https = require('https');
let http = require('http');


const app = express()

let credentials = {
    key: fs.readFileSync('./server.key', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8'),
    ca: [
        fs.readFileSync('./ca_bundle.crt')
    ]
};
let httpsServer = https.createServer(credentials, app);

let httpServer = http.createServer(app);

app.use(helmet())

var whitelist = ['https://lib.qbit-club.com', 'https://proviant.store', 'https://summer.qbit-club.com']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
// app.use(express.static('public'))


const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
process.env.TOKEN_SECRET;

function generateAccessToken(app) {
    return jwt.sign(app, process.env.TOKEN_SECRET, {
        expiresIn: '30000s'
    });
}

app.get('/', (req, res) => {
    const token = generateAccessToken({
        app: "library"
    });
    res.json(token);
});



const booksMethods = require('./middlewares/books')
const authenticateToken = require('./middlewares/authenticateToken')


app.get('/api/books/get-all', authenticateToken, booksMethods.getAllBooks)
app.post('/api/books/get-by-id', booksMethods.getBookById)
app.post('/api/books/unreserve-all', authenticateToken, booksMethods.unreserveAllBooks)
app.post('/api/books/unreserve-one', authenticateToken, booksMethods.unreserveOneBook)
app.post('/api/books/delete-by-id', authenticateToken, booksMethods.deleteBookById)
app.post('/api/books/create', authenticateToken, booksMethods.createBook)
app.put('/api/books/update', authenticateToken, booksMethods.updateBook)
app.put('/api/books/change-state', authenticateToken, booksMethods.changeBooksState)
app.get('/api/books/clear', booksMethods.clearBooks) // disabled for security


const bookflowMethods = require('./middlewares/bookflow')

app.get('/api/bookflow/get-all', authenticateToken, bookflowMethods.getAllBookflow)
app.post('/api/bookflow/create', authenticateToken, bookflowMethods.createBookflow)
app.get('/api/bookflow/clear', bookflowMethods.clearBookflow) // disabled for security


const userMethods = require('./middlewares/users')

app.get('/api/users/get-all', authenticateToken, userMethods.getAllUsers)
app.post('/api/users/create', authenticateToken, userMethods.createUser)
app.get('/api/users/clear', authenticateToken, userMethods.clearUsers) // disabled for security
app.put('/api/users/update', authenticateToken, userMethods.updateUser)
app.post('/api/users/get-by-email', authenticateToken, userMethods.getUserByEmail)


//nodemailer api
const nodemailerMethods = require('./middlewares/nodemailer.js')

app.post('/api/proviant', nodemailerMethods.proviant)
app.post('/api/summer', nodemailerMethods.summer)

// server start
httpServer.listen(HTTPPORT, HOST, function () {
    console.log(`App is listening on HTTP port ${HTTPPORT}`)
});

httpsServer.listen(HTTPSPORT, HOST, function () {
    console.log(`App is listening on HTTPS port ${HTTPSPORT}`)
});