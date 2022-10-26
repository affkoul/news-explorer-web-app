const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/index.js');
const https = require('https');
const fs = require('fs');

const { requestLogger, errorLogger } = require('./middleware/logger');
const { limiter } = require('./utils/constants');
const { errorsHandling } = require('./middleware/errors.js');
const {
  ERROR_MESSAGES,
  STATUS_CODES,
  DB_ADDRESS,
} = require('./utils/constants');

// const { PORT = 3000 } = process.env;
const { PORT } = process.env;

const app = express();

const allowedCors = [
  'http://localhost:3000',
  'https://newsapi.org/v2',
  'https://nomoreparties.co/news/v2',
];

mongoose.connect(DB_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
  const { origin } = req.headers;

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

app.use(cors());
app.options('*', cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(requestLogger);

app.use('/', routes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.status(STATUS_CODES.notFound).send({ message: ERROR_MESSAGES.notFound });
});

app.use(limiter);
app.use(errorLogger);
app.use(errors());

app.use(errorsHandling);

// app.listen(PORT, () => {
//   console.log(`App listening at port ${PORT}`);
// });

https.createServer({
  key: fs.readFileSync(
    "",
    "utf8"
  ),
  cert: fs.readFileSync(
    "",
    "utf8"
  ),
},
  app
).listen(PORT, () => {
  console.log("Express JS HTTPS Server started on port " + PORT)
})
