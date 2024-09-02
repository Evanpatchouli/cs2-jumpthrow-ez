# Device Interception Example

<p align="left">
  <a href="#"><img alt="github" src="https://img.shields.io/badge/Github-grey.svg"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/license-LGPL3-green.svg"></a>
  <a href="#"><img alt="platform" src="https://img.shields.io/badge/os-windows_11-blue.svg"></a>
  <a href="#"><img alt="NodeJS" src="https://img.shields.io/badge/NodeJS-16+-green.svg"></a>
  <a href="#"><img alt="CS:GO" src="https://img.shields.io/badge/CS:GO-black.svg"></a>
</p>

An example Node.js application to capture keyboard and mouse strokes on **windows**.

## Disclaimer

<font color="red">Warn! This project is for learning and communication purposes only, and if it is used in the game, you may be banned by VAC! We are not responsible if you are banned for this</font>

### Installing the driver

Using a command prompt with **Administrative Privileges**:

```cmd
npm run install:driver
```

> You can uninstall it later using `npm run uninstall:driver` instead.

You'll need to **restart** for the driver installation to be complete.

## Example Usage

In example codes below, stop-automatic and some throw-actions in _Counter-Strike 2_ are applied, and `J` is set to toggle whether or not to enable the automatic-emergency-stop hack. `F7` is set to trigger the jump-throw action.

You can execuate `npm run start:node` or `npm run start:bun` to run `index.js` with **node** or **bun**.

```javascript
function main() {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);
  logger.info("【F7】跳投");
  logger.info("【F8】右键跳投");
  logger.info("【F9】前跳投");
  logger.info("【F10】双键跳投");
  logger.info("【F11】前双键跳投");
  logger.info("【F12】Mirage VIP 慢烟");

  state.SET_JITING(true);
  state.SET_USE_JT_DURATION_CALC(true);
  logger.info(`${chalk.yellow("Stop Emergency")} is ${chalk.yellow(!state.useJiting ? "disabled" : "enabled")}`);

  core
    .listen("keyboard", {
      after: async (stroke, input, baseKey, device) => {
        concurrentify(
          // Add your side-effect handler below  往下添加附作用事件
          jiting(stroke, input, "J"), // automatic-emergency-stop  jiting(stroke, input, "J", "K"), set the fourth parameter to switch the duration key.
          jumpThrow(stroke, input, "F7"), // jump + attack1
          jumpThrow2(stroke, input, "F8"), // jump + attack2
          forwardJumpThrow(stroke, input, "F9"), // forward + jump + attack1
          jumpDoubleThrow(stroke, input, "F10"), // jump + attack1 + attack2
          forwardJumpDoubleThrow(stroke, input, "F11"), // forward + jump + attack1 + attack2
          rightJumpThrow(stroke, input, "F12") // right + wait(200) + jump + attack1
        );
      },
    })
    .catch((error) => logger.error(error));
}
```

## Run with PM2

You can use `pm2` to keep running the script in the background.

I have provided a two pm2 configuration files at the pm2 directory. Before using it, you need to install `pm2` globally:

```shell
npm install -g pm2
```

And modify these files to fit your environment. Mainly, you need to update thehe premeters:

- `cwd`: the root directory to execute the script
- `interpreter`: the interpreter of the script, such as the absolute path of `bun.exe`
- `out_file`: the path of the output file, could be absolute or relative (cwd)
- `error_file`: the path of the error file, could be absolute or relative (cwd)
- `env`: if you need to set some environment variables

Then you can run the script with pm2 just like:

```shell
# my project path is at D:\Work\device-interception-example
pm2 start ./pm2/serve.json
```

By this way, the server is running in the background, and i can use web monitor to manage it.

## Exception

If you encounter the following error:

- script is running, but hack is not working, maybe the device used is not the one actually used in the game.
  - You can check the device by `console.log(device)` in the handler to know which device in devices is used.
- script is running as well as hack, but the output action is not as expected, maybe the key-binding at your machine is different from the example codes.
  - You can run the `check.js` to check the key-binding, and update the `key_codes` and `mouse_codes` in `core` yourself.
- script is terminated, maybe it is killed by the anti-hack system of the game.
  - For this case, you'd better not to run this script in the game. Because it may cause you to be banned by the game.

## Credits

- [Oblitum] for creating the original interception library.
- [Rami Sabbagh] for the wrapper library `node-interception`.
- [Evanpatchouli] for creating this project.

[GitHub]: https://github.com/Evanpatchouli/device-interception-example
[Driver]: https://github.com/oblitum/Interception
[Oblitum]: https://github.com/oblitum
[node-interception]: https://github.com/Rami-Sabbagh/node-interception
[Rami Sabbagh]: https://github.com/Rami-Sabbagh
[Evanpatchouli]: https://github.com/Evanpatchouli
