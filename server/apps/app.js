import express from 'express';
import path from 'path';
import router from '../router/index.js';
import { excatcher, exlogger } from '../midwares/exhandler.js';
import config from "../config.js";

const { monitorPath, PUBLIC } = config;

console.log(`Monitor path: ${monitorPath}`, `Public path: ${PUBLIC}`);

const app = express();


app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return res.end();
  } else {
    next();
  }
  next();
});

app.use(monitorPath, express.static(PUBLIC));
app.use('/api', router);
app.use(excatcher);
app.use(exlogger);

export default app;

