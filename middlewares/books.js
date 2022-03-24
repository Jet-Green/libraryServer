const { response } = require('express');
let { getBooks, getBookflow, getUsers } = require('../mongo')

function getAllBooks(request, response) {
    // send all books
    const books = getBooks()
    books.find({}).toArray(function (err, documents) {
        response.send(JSON.stringify(documents));
    });
}

function deleteBookById(request, response) {
    const books = getBooks();
    let id = request.body.id

    books.deleteOne({ Id: { $eq: id } })
        .then((r) => {
            console.log(`Delete book with Id ${id} `, r)
            response.send(r)
        })
        .catch((err) => console.error('Cannot delete book with error', err))
}

function getBookById(request, response) {
    const books = getBooks();
    const bookId = request.body.id;

    books.find({
        id: bookId
    })
        .toArray(function (err, documents) {
            response.send(JSON.stringify(documents));
        })
}

function createBook(request, response) {
    const books = getBooks();

    let book = request.body;
    books.insertOne(book)
        .then((r) => response.send(r))
        .catch((err) => console.error('create book with error: ', err))

}

function updateBook(request, response) {
    const books = getBooks();

    let setupOptions = request.body.setupOptions;
    let id = request.body.id;
    console.log(id, setupOptions)
    books.updateOne(
        { 'Id': { $eq: id } },
        setupOptions,
        { upsert: false }
    )
        .then((r) => console.log('Update book ', r))
        .catch((err) => console.error('update book with error: ', err))
}

function changeBooksState(req, response) {
    const books = getBooks()

    const bookflow = getBookflow()
    const users = getUsers()

    let eventType = req.body.eventType;
    let event = req.body.e;
    console.log(req.body)

    if (eventType != null || eventType != undefined) {
        if (eventType == 'reserve') {
            // UPDATE USER
            users.updateOne(
                { "Contacts.Email": { $eq: event.UserEmail } },
                { $set: { 'CurrentReservedBooks': event.BookId } },
                { upsert: false }
            ).then(function (r) {
                console.log('user succesfully updated', r)
            }).catch(err => {
                console.error(err)
            })

            // UPDATE BOOK
            books.updateOne({
                'Id': { $eq: event.BookId }
            }, { $set: { "Status": event.BookStatus, "ReservedQueue": event.UserEmail } }, {
                upsert: false
            }).then((r) => {
                console.log('update book ', r)
                response.send(r)
            }).catch((err) => { console.error(err) })
        } else if (eventType == 'give') {
            // UPDATE USER
            users.updateOne(
                { "Contacts.Email": { $eq: event.UserEmail } },
                { $set: { 'CurrentTakenBooks': event.BookId } },
                { upsert: false }
            ).then(function (r) {
                console.log('user succesfully updated', r)
            }).catch(err => {
                console.error(err)
            })

            // UPDATE BOOK
            books.updateOne({
                'Id': { $eq: event.BookId }
            }, { $set: { "Status": event.BookStatus, "TemporaryOwner": event.UserEmail, "DateOfGivenOut": event.TimeStamp } }, {
                upsert: false
            }).then((r) => {
                console.log('update book ', r)
                response.send(r)
            }).catch((err) => { console.error(err) })
        } else if (eventType == 'return') {
            // UPDATE USER
            users.updateOne(
                { "Contacts.Email": { $eq: event.UserEmail } },
                { $set: { 'CurrentTakenBooks': '' } },
                { upsert: false }
            ).then(function (r) {
                console.log('user succesfully updated', r)
            }).catch(err => {
                console.error(err)
            })

            // UPDATE BOOK
            books.updateOne({
                'Id': { $eq: event.BookId }
            }, { $set: { "Status": event.BookStatus, "TemporaryOwner": '', "DateOfGivenOut": '', "ReservedQueue": '' } }, {
                upsert: false
            }).then((r) => {
                console.log('update book ', r)
                response.send(r)
            }).catch((err) => { console.error(err) })
        }
    }

    // CREATE BOOKFLOW
    bookflow.insertOne(event)
        .then((r) => { console.log('create bookflow e ', r) })
        .catch((err) => { console.error(err) })

}

function clearBooks(request, response) {
    const books = getBooks()

    return;
    books.deleteMany({})
        .then((r) => console.log('clear books ', r))
        .catch((err) => console.error(err))
}

module.exports = {
    getAllBooks,
    deleteBookById,
    getBookById,
    createBook,
    updateBook,
    changeBooksState,
    clearBooks
}