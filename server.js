const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const db = require('./db')
var nodemailer = require('nodemailer');
app.set("view engine", "hbs");
app.use(express.static(__dirname + '/public'));
var MySQLStore = require('express-mysql-session')(session);
var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'session_test'
};

var sessionStore = new MySQLStore(options);

app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

app.use(
  session({
    secret: "nobody should guess this",
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

const loggedInOnly = (failure = "/login") => (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect(failure);
  }
};

app.get("/", loggedInOnly(), (req, res) => {
  db.getAllBands()
    .then((bands) => {

      res.render('bands', {
        bands,
        name: req.session.user.username,
        id: req.session.user.id
      })
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

app.get('/delete/:id', (req, res) => {
  db.removeBand(req.params.id)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get('/update/:id', (req, res) => {
  res.render('band_update', {
    id: req.params.id
  })
})

app.get('/signup', (req, res) => {
  res.render('signup')
})

app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword')
})

app.get('/profile', (req, res) => {
  db.getUserDetails(req.session.user.username)
  .then((users) => {
    res.render('profile', {
     users
    })
  })
  .catch((err) => {
    res.send(err)
  })
})

app.post('/update', (req, res) => {
  db.updateBand(req.body.bandName, req.body.id)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get('/useradd', (req, res) => {
  res.render('login')
})

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.checkUser(username, password)
    .then(() => {
      req.session.user = {
        id: 1,
        username: username,
        about: "developer and reader"
      };
      res.redirect('/')
    })
    .catch((err) => {
      res.sendStatus(401)
    })
})

app.post('/useradd', (req, res) => {
  db.addNewUser(req.body.uname, req.body.password, req.body.company, req.body.date, req.body.email)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.post('/forgotpassword', (req, res) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'youremail@gmail.com',
      pass: 'yourpassword'
    }
  });
  let no = Math.floor(1000 + Math.random() * 9000);
  req.session.no = no.toString();
  let email = req.body.email
  req.session.email = email
  var mailOptions = {
    from: 'youremail@gmail.com',
    to: req.body.email,
    subject: 'RESET PASSWORD',
    text: no.toString()
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render('enterotp')
})

app.get('/resetpassword', (req, res) => {
  res.render('login')
})

app.post('/resetpassword', function (req, res) {
  db.resetPassword(req.session.email, req.body.password)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.post('/otpset', (req, res) => {
  let no = (req.session.no).toString();
  console.log(typeof (no))
  if (no.localeCompare(req.body.otp) == 0)
    res.render('resetpassword')
  else
    res.render('login')
})

app.post('/add', (req, res) => {
  db.addNewBand(req.body.bandName, req.session.user.username)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get('/logout', (req, res) => {
  delete req.session.user.username;
  req.session.destroy()
  res.render("login")
})

app.listen(8080);