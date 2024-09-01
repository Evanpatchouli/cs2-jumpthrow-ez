import cfg from '../app.config.js';
import chalk from 'chalk';
import server from './server.js';
import init from './utils/init.js';

const listen = async (action) => {
  await init();
  server.listen(cfg.port, () => {
    console.log(chalk.yellow(`------------------ ${cfg.name} ------------------`));
    console.log(`${chalk.green(cfg.name)} is listening at ${chalk.hex("#24a9cd")(`http://localhost:${cfg.port}`)}`);
    console.log(chalk.green('Monitor') + ' is deployed at ' + chalk.hex("#24a9cd")(`http://localhost:${cfg.port}/monitor`));
    action?.();
  })
}

export default {
  listen,
};