let express = require('express')
let cors = require('cors')

const corsOptions = {
    origin: 'http://localhost:8080',
}

// const {
//     response
// } = require('express');
const app = express()


app.use(cors(corsOptions))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())


const {
    getAllBooks,
    deleteBookById,
    getBookById,
    createBook,
    updateBook,
    changeBooksState,
    clearBooks
} = require('./middlewares/books')

app.get('/api/books/get-all', getAllBooks)
app.post('/api/books/delete-by-id', deleteBookById)
// id must be provided in query
app.get('/api/books', getBookById)
app.post('/api/books/create', createBook)
app.put('/api/books/update', updateBook)
app.put('/api/books/change-state', changeBooksState)
app.get('/api/books/clear', clearBooks) // disabled for security


const {
    getAllBookflow,
    createBookflow,
    clearBookflow
} = require('./middlewares/bookflow')

app.get('/api/bookflow/get-all', getAllBookflow)
app.post('/api/bookflow/create', createBookflow)
app.get('/api/bookflow/clear', clearBookflow) // disabled for security


const {
    getAllUsers,
    createUser,
    clearUsers,
    updateUser,
    getUserByEmail
} = require('./middlewares/users')

app.get('/api/users/get-all', getAllUsers)
app.post('/api/users/create', createUser)
app.get('/api/users/clear', clearUsers) // disabled for security
app.put('/api/users/update', updateUser)
app.post('/api/users/get-by-email', getUserByEmail)


const PORT = 3000
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`)
})