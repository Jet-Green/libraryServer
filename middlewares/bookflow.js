const { getBookflow } = require('../mongo')

function getAllBookflow(request, response) {
    const bookflow = getBookflow()
    bookflow.find().toArray(function (err, documents) {
        response.send(JSON.stringify(documents));
    });
}

function createBookflow(request, response) {
    const bookflow = getBookflow()

    bookflow.insertOne(request.body)
        .catch((err) => console.error(err))
}

function clearBookflow(request, response) {
    return;
    const bookflow = getBookflow()

    bookflow.deleteMany({})
        .then((r) => console.log('clear bookflow', r))
        .catch((err) => console.error(err))
}

module.exports = {
    getAllBookflow,
    createBookflow,
    clearBookflow
}