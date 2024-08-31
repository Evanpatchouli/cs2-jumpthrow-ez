import express from 'express';
import cfg from '../app.config.js';
import chalk from 'chalk';
import router from './router/index.js';
import path from 'path'

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, './public');

const server = express();
server.use('/', express.static(PUBLIC));
server.use(router);

const listen = (action) => {
  server.listen(cfg.port, () => {
    console.log(chalk.yellow(`------------------ ${cfg.name} ------------------`));
    console.log(`${chalk.green(cfg.name)} is listening at ${chalk.hex("#24a9cd")(`http://localhost:${cfg.port}`)}`);
    action?.();
  })
}

export default {
  listen,
};