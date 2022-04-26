const HTTPSPORT = 3100
const HTTPPORT = 3000
const HOST = '0.0.0.0'

const express = require('express')
const cors = require('cors')
let fs = require('fs');
const helmet = require("helmet");
const cookieParser = require('cookie-parser')
const csurf = require('csurf')
let https = require('https');
let http = require('http');


const corsOptions = {
    "origin": 'http://localhost:8080/'
}
const csrfProtection = csurf({ cookie: true })


const helmet = require("helmet");

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
app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(express.static('public'))


app.get('/csrf', csrfProtection, function (request, response) {
    response.send({ 'csrfToken': request.csrfToken() })
})


const booksMethods = require('./middlewares/books')


app.get('/api/books/get-all', booksMethods.getAllBooks)
app.post('/api/books/unreserve-all', booksMethods.unreserveAllBooks)
app.post('/api/books/unreserve-one', booksMethods.unreserveOneBook)
app.post('/api/books/delete-by-id', booksMethods.deleteBookById)
app.post('/api/books/get-by-id', booksMethods.getBookById)
app.post('/api/books/create', booksMethods.createBook)
app.put('/api/books/update', booksMethods.updateBook)
app.put('/api/books/change-state', booksMethods.changeBooksState)
app.get('/api/books/clear', booksMethods.clearBooks) // disabled for security


const bookflowMethods = require('./middlewares/bookflow')

app.get('/api/bookflow/get-all', bookflowMethods.getAllBookflow)
app.post('/api/bookflow/create', bookflowMethods.createBookflow)
app.get('/api/bookflow/clear', bookflowMethods.clearBookflow) // disabled for security


const userMethods = require('./middlewares/users')

app.get('/api/users/get-all', userMethods.getAllUsers)
app.post('/api/users/create', userMethods.createUser)
app.get('/api/users/clear', userMethods.clearUsers) // disabled for security
app.put('/api/users/update', userMethods.updateUser)
app.post('/api/users/get-by-email', userMethods.getUserByEmail)




// app.listen(HTTPPORT, HOST, function () {
//     console.log(`App is listening on HTTP port ${HTTPPORT}`)
// })

// your express configuration here


httpServer.listen(HTTPPORT, HOST, function () {
    console.log(`App is listening on HTTP port ${HTTPPORT}`)
});

httpsServer.listen(HTTPSPORT, HOST, function () {
    console.log(`App is listening on HTTPS port ${HTTPSPORT}`)
});