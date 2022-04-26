const {
    getUsers
} = require('../mongo')

function getAllUsers(requset, response) {
    const users = getUsers()

    users.find().toArray(function (err, documents) {
        response.send(JSON.stringify(documents));
    });
}

function createUser(request, response) {
    const users = getUsers()

    users.insertOne(request.body).then((r) => {
       
        response.send('OK')
    }).catch((err) => {
        console.error(err)
        response.send(err)
    })
}

function clearUsers(request, response) {
    const users = getUsers()

    // { 'Contacts.Email': { $eq: 'grishadzyin@gmail.com' } }
    return;
    users.deleteMany({})
        .then((r) => console.log('users cleared', r))
        .catch((err) => console.error('cannot clear users with error', err))

}

function updateUser(request, response) {
    const users = getUsers()

    let setupOptions = request.body.setupOptions;
    let Email = request.body.email;
    // return;
    /**
     * Добавить проверку наличия пользователя
     */
    users.updateOne({
            "Contacts.Email": {
                $eq: Email
            }
        },
        setupOptions, {
            upsert: false
        }
    ).then(function (r) {
        // console.log('user succesfully updated', r)
        response.send(r)
    }).catch(err => {
        console.error(err)
        response.send(err)
    })
}

function getUserByEmail(req, res) {
    const users = getUsers()

    let Email = req.body.email;

    users.findOne({
        "Contacts.Email": {
            $eq: Email
        }
    }).then(function (user) {
        res.send(user)
    }).catch(function (err) {
        console.error('cannot get user by email, error: ', err)
    });
}

module.exports = {
    getAllUsers,
    createUser,
    clearUsers,
    updateUser,
    getUserByEmail
}