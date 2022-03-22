let mongoClient = require('mongodb').MongoClient
const {
    url
} = require('./password');


let books, bookflow, users
mongoClient.connect(url, function (err, client) {
    let database = client.db("libraryFromNode")
    books = database.collection("books")
    bookflow = database.collection("bookflow")
    users = database.collection("users")
    console.log('mongo connected')
})

function getBooks() {
    return books;
}

function getBookflow() {
    return bookflow
}

function getUsers() {
    return users;
}

module.exports = { getBooks, getBookflow, getUsers }