let {
  getBooks,
  getBookflow,
  getUsers
} = require('../mongo')

function checkVariable(collection, query, variableToCheck, value) {
  return collection.find(query).toArray()
    .then(result => {
      return result[0][variableToCheck] === value;
    })
    .catch(err => console.error('cannot find', err))
}

function getVariable(collection, query, variable) {
  return collection.find(query).toArray()
    .then(result => {
      return result[0][variable];
    })
    .catch(err => console.error('cannot find variable, error: ', err))
}


function getAllBooks(request, response) {
  const books = getBooks()
  books.find({}).toArray(function (err, documents) {
    response.send(JSON.stringify(documents));
  });
}

function deleteBookById(request, response) {
  const books = getBooks();
  let id = request.body.id

  books.deleteOne({
    Id: {
      $eq: id
    }
  })
    .then((r) => {
      response.send(r)
    })
    .catch((err) => console.error('Cannot delete book, error: ', err))
}

function getBookById(request, response) {

  getBooks().findOne({
    'Id': {
      $eq: Number(request.body.id)
    }
  }
  ).toArray(function (err, documents) {
    response.send(JSON.stringify(documents));
  })
}

function createBook(request, response) {

  getBooks()
    .insertOne(request.body)
    .catch((err) => console.error('cannot create book, error: ', err))
}

function updateBook(request, response) {
  const books = getBooks();

  let setupOptions = request.body.setupOptions;
  let id = request.body.id;

  books.updateOne({
    'Id': {
      $eq: id
    }
  },
    setupOptions, {
    upsert: false
  }
  ).catch((err) => console.error('cannot update book, error: ', err))
}

async function changeBooksState(req, response) {
  const books = getBooks()

  const bookflow = getBookflow()
  const users = getUsers()

  let eventType = req.body.eventType;
  let event = req.body.e;

  let currentBookStatus = await getVariable(books, {
    Id: {
      $eq: req.body.e.BookId
    }
  }, 'Status')

  if (eventType != null || eventType != undefined) {
    if (eventType == 'reserve'
      //  && currentBookStatus !== "Зарезервирована"
    ) {
      // UPDATE USER
      users.updateOne({
        "Contacts.Email": {
          $eq: event.UserEmail
        }
      }, {
        $set: {
          'CurrentReservedBooks': event.BookId
        }
      }, {
        upsert: false
      }).catch(err => {
        console.error('cannot update user, error: ', err)
      })

      // UPDATE BOOK
      books.updateOne({
        'Id': {
          $eq: event.BookId
        }
      }, {
        $set: {
          "Status": event.BookStatus,
          "ReservedQueue": event.UserEmail,
          "DateOfReserved": event.TimeStamp
        }
      }, {
        upsert: false
      })
        .then((res) => response.send('OK'))
        .catch((err) => {
          console.error(err)
        })

      bookflow.insertOne(event).catch((err) => {
        console.error('cannot create bookflow, error: ', err)
      })
    } else if (eventType == 'give'
      //  && currentBookStatus !== 'Выдана'
    ) {
      // UPDATE USER
      users.updateOne({
        "Contacts.Email": {
          $eq: event.UserEmail
        }
      }, {
        $set: {
          'CurrentTakenBooks': event.BookId,
          'CurrentReservedBooks': ''
        }
      }, {
        upsert: false
      }).catch(err => {
        console.error('cannot update user, error: ', err)
      })


      // UPDATE BOOK
      books.updateOne({
        'Id': {
          $eq: event.BookId
        }
      }, {
        $set: {
          "Status": event.BookStatus,
          "TemporaryOwner": event.UserEmail,
          "DateOfGivenOut": event.TimeStamp,
          'ReservedQueue': '',
          'DateOfReserved': ''
        }
      }, {
        upsert: false
      })
        .then((res) => response.send('OK'))
        .catch((err) => {
          console.error(err)
        })

      bookflow.insertOne(event).catch((err) => {
        console.error('cannot create bookflow, error: ', err)
      })
    } else if (eventType == 'return'
      //  && currentBookStatus !== 'На месте'
    ) {
      // UPDATE USER
      users.updateOne({
        "Contacts.Email": {
          $eq: event.UserEmail
        }
      }, {
        $set: {
          'CurrentTakenBooks': ''
        }
      }, {
        upsert: false
      }).catch(err => {
        console.error('cannot update user, error: ', err)
      })

      // UPDATE BOOK
      books.updateOne({
        'Id': {
          $eq: event.BookId
        }
      }, {
        $set: {
          "Status": event.BookStatus,
          "TemporaryOwner": '',
          "DateOfGivenOut": '',
          "ReservedQueue": '',
          "DateOfReserved": ''
        }
      }, {
        upsert: false
      })
        .then((res) => response.send('OK'))
        .catch((err) => {
          console.error('cannot update book, error: ', err)
        })

      bookflow.insertOne(event).catch((err) => {
        console.error('cannot create bookflow, error: ', err)
      })
    }
  }
}

function clearBooks(request, response) {
  const books = getBooks()

  return;
  books.deleteMany({})
    .then((r) => console.log('clear books ', r))
    .catch((err) => console.error(err))
}

function unreserveAllBooks(request, response) {
  // UPDATE BOOKS
  const books = getBooks()
  let now = Date.now()
  books.find(
    {
      $and: [
        {
          $expr: {
            $lt: [
              now - Number('$DateOfReserved'),
              // 3 days
              1000 * 60 * 60 * 24 * 3
            ]
          }
        },
        { 'DateOfReserved': { $ne: "" } }
      ]

    }
  ).toArray(function (err, documents) {
    // HERE WE WILL UPDATE BOOKS AND USERS
    for (doc of documents) {
      let id = doc.Id
      let email = doc.ReservedQueue
      books.updateOne(
        {
          "Id":
            { $eq: id }
        },
        {
          $set: {
            "Status": "На месте",
            "ReservedQueue": "",
            "DateOfReserved": ""
          }
        },
        {
          upsert: false
        })

      getUsers().updateOne({
        "Contacts.Email":
          { $eq: email }
      },
        {
          $set: {
            'CurrentReservedBooks': ''
          }
        }, {
        upsert: false
      }
      )
    }
  });

}

function unreserveOneBook(req, res) {
  // UPDATE BOOK
  getBooks().updateOne({
    'Id': {
      $eq: req.body.BookId
    }
  }, {
    $set: {
      "Status": "На месте",
      "ReservedQueue": "",
      "DateOfReserved": ""
    }
  }, {
    upsert: false
  })
    .catch(err => {
      console.error('cannot unreserve all books, error:', err)
    })
  // UPDATE USER

  getUsers().updateOne({
    "Contacts.Email": {
      $eq: req.body.UserEmail
    }
  }, {
    $set: {
      'CurrentReservedBooks': ''
    }
  }, {
    upsert: false
  }).catch(err => {
    console.error('cannot update user, error: ', err)
  }).then(() => { res.send('OK') })


}

module.exports = {
  getAllBooks,
  deleteBookById,
  getBookById,
  createBook,
  updateBook,
  changeBooksState,
  clearBooks,
  unreserveAllBooks,
  unreserveOneBook
}