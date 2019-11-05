const mysql = require('mysql')

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'finalassignment'
    }
)

function addNewUser(uname, password, company, dateOfBirth, email) {
    return new Promise(function (resolve, reject) {
        connection.query(`INSERT INTO user(name,password,company,dateOfBirth,email) values(?,?,?,?,?)`,
            [uname, password, company, dateOfBirth, email],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}

function checkUser(username, password) {
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT * FROM user WHERE name = ? AND password = ?`,
            [username, password],
            function (err, rows, cols) {
                if (err)
                    reject(err)
                else {
                    if (rows.length > 0)
                        resolve()
                    else
                        reject(err)
                }
            })
    })
}

function resetPassword(email, password) {
    return new Promise(function (resolve, reject) {
        connection.query(`update user set password=? where email=?`,
            [password, email],
            function (err, rows, cols) {
                if (err)
                    reject(err)
                else
                    resolve(rows)
            })
    })
}

function getAllBands() {
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT * from band`,
            function (err, rows, cols) {
                if (err)
                    reject(err)
                else
                    resolve(rows)
            })
    })
}

function addNewBand(bandName, name) {
    return new Promise(function (resolve, reject) {
        connection.query(`INSERT INTO band(bandName,name) values(?,?)`,
            [bandName, name],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}

function removeBand(Sno) {
    return new Promise(function (resolve, reject) {
        connection.query(`DELETE FROM band where Sno = ?`,
            [Sno],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}

function updateBand(bandName, Sno) {
    return new Promise(function (resolve, reject) {
        connection.query(`update band set bandName = ? where Sno = ?`,
            [bandName, Sno],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}

function getUserDetails(username){
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT * from user where name=?`,
        [username],
            function (err, rows, cols) {
                if (err)
                    reject(err)
                else
                    resolve(rows)
            })
    })
}

exports = module.exports = {
    getAllBands,
    addNewBand,
    removeBand,
    updateBand,
    checkUser,
    addNewUser,
    resetPassword,
    getUserDetails
}