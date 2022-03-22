let express = require('express')
var cors = require('cors')


let mongoClient = require('mongodb').MongoClient
const {
    url
} = require('./password');
const {
    response
} = require('express');
const e = require('express');

let books, bookflow, users
mongoClient.connect(url, function (err, client) {
    let database = client.db("libraryFromNode")
    books = database.collection("books")
    bookflow = database.collection("bookflow")
    users = database.collection("users")
    console.log('mongo connected')
})




const app = express()
app.use(cors())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())


// app.post('/sendBook', function (request, response) {
//     let books = database.collection("books")
//     // console.log(books)
//     // console.log(request.body)

//     books.insertOne({
//         id: request.body.id,
//         name: request.body.name,
//         author: request.body.author
//     })

//     // books.find().toArray(function (err, documents) {
//     //     response.send(JSON.stringify(documents));
//     //     console.log(JSON.stringify(documents))
//     // });
// })
// listen to get all books
app.get('/api/books/get-all', function (request, response) {

    // send all books
    books.find({}).toArray(function (err, documents) {
        response.send(JSON.stringify(documents));
    });
})

app.post('/api/books/delete-by-id', function (request, response) {
    let id = request.body.id

    books.deleteOne({ Id: { $eq: id } })
        .then((r) => console.log(`Delete book with Id ${id} `, r))
        .catch((err) => console.error('Cannot delete book with error', err))
})

app.get('/api/books', function (request, response) {

    const bookId = request.query.id;

    books.find({
        id: bookId
    }).toArray(function (err, documents) {
        response.send(JSON.stringify(documents));

    })
})

app.post('/api/books/create', function (request, response) {

    let book = request.body;

    try {
        books.insertOne(book)
        response.send('OK')
    } catch (err) {
        console.error(err)
    }
})

app.put('/api/books/update', function (request, response) {

    let setupOptions = request.body.setupOptions;
    let id = request.body.id;
    console.log(id, setupOptions)
    try {
        books.updateOne({
            'Id': { $eq: id }
        }, setupOptions, {
            upsert: false
        })

    } catch (err) {
        console.error(err)
    }
})

app.put('/api/books/change-state', function (req, res) {
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
            }).catch((err) => { console.error(err) })
        }
    }

    // CREATE BOOKFLOW
    bookflow.insertOne(event)
        .then((r) => { console.log('create bookflow e ', r) })
        .catch((err) => { console.error(err) })

})

app.get('/api/books/clear', function (request, response) {

    try {
        books.deleteMany({})
        books.find().toArray(function (err, documents) {
            response.send(JSON.stringify(documents));

        });
    } catch (err) {
        console.error(err)
    }
})


app.get('/api/bookflow/get-all', function (request, response) {

    bookflow.find().toArray(function (err, documents) {
        response.send(JSON.stringify(documents));

    });
})

app.post('/api/bookflow/create', function (request, response) {

    try {
        bookflow.insertOne(request.body)
        response.send('OK')
    } catch (err) {
        console.error(err)
    }
})

app.get('/api/bookflow/clear', function (request, response) {

    try {
        bookflow.deleteMany({})
        bookflow.find().toArray(function (err, documents) {
            response.send(JSON.stringify(documents));

        });
    } catch (err) {
        console.error(err)
    }
})

app.get('/api/users/get-all', function (request, response) {

    users.find().toArray(function (err, documents) {
        response.send(JSON.stringify(documents));

    });
})

app.post('/api/users/create', function (request, response) {
    users.insertOne(request.body).then((r) => {
        console.log('user created', r)
        response.send('OK')
    }).catch((err) => {
        console.error(err)
        response.send(err)
    })
})

app.get('/api/users/clear', function (request, response) {
    // { 'Contacts.Email': { $eq: 'grishadzyin@gmail.com' } }
    return;
    try {
        users.deleteMany({})
        users.find().toArray(function (err, documents) {
            response.send(JSON.stringify(documents));

        });
    } catch (err) {
        console.error(err)
    }
})

app.put('/api/users/update', function (request, response) {
    let setupOptions = request.body.setupOptions;
    let Email = request.body.email;
    // return;
    /**
     * Добавить проверку наличия пользователя
     */

    users.updateOne(
        {
            "Contacts.Email": {
                $eq: Email
            }
        },
        setupOptions,
        { upsert: false }
    ).then(function (r) {
        console.log('user succesfully updated', r)
        response.send(r)
    }).catch(err => {
        console.error(err)
        response.send(err)
    })
})

app.post('/api/users/get-by-email', function (req, res) {

    let Email = req.body.email;

    users.findOne({
        "Contacts.Email": {
            $eq: Email
        }
    }).then(function (user) {
        console.log("send user to client: ", user)
        res.send(user)
    }).catch(function (err) {
        console.error(err)
    });

})

app.listen(3000)