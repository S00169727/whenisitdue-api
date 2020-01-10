const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const chalk = require('chalk');
const helmet = require('helmet');

/**
 * Environment Variables
 */
dotenv.config();

/**
 * Express App
 */
const app = express();
const PORT = process.env.PORT || 1111;

/**
 * Middleware
 */
console.log(chalk.blue('Initializing Middleware...'));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);
app.use(morgan('dev'));

app.use('/api/user', require('../routes/user'));
app.use('/api/team', require('../routes/team'));
app.use('/api/post', require('../routes/post'));
app.use('/api/invitation', require('../routes/invitation'));
app.use('/api/comment', require('../routes/comment'));

/**
 * Error handling
 */
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res) => {
  res.status(error.status || 500).json({
    message: error.message,
  });
});

/**
 * MongoDB Connection
 */
console.log(chalk.blue('Establishing Database Connection...'));
mongoose
  .connect(process.env.MONGODB_URI,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true })
  .then(() => {
    app.listen(PORT, console.log(chalk.yellow(`✔︎ Server started on port ${PORT}`)));
  })
  .catch((err) => {
    console.log(err);
    console.log(chalk.red('Shutting down OSKills Server'));
  });

/**
 * Database Connection Events
 */
const { connection } = mongoose;
connection.on('connected', () => {
  console.log(chalk.green(`✔︎ Connected to Database: ${process.env.MONGODB_URI}`));
});
connection.on('error', (err) => {
  console.log(chalk.red(`✘ Database Error: ${err}`));
});
connection.on('disconnected', () => {
  console.log(chalk.red('✘ Disconnected from Database'));
});
connection.on('reconnected', () => {
  console.log(chalk.green(`✔︎ Reconnected to Database: ${process.env.MongoURI}`));
});
