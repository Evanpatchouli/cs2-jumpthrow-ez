import express from 'express';
import path from 'path';
import router from '../router/index.js';
import { excatcher, exlogger } from '../midwares/exhandler.js';

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, './public');

const app = express();


app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});

app.use('/monitor', express.static(PUBLIC));
app.use('/api', router);
app.use(excatcher);
app.use(exlogger);

export default app;

