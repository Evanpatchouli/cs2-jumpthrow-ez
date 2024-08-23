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

In example codes below, stop-automatic and some throw-actions in _Counter-Strike 2_ are applied, and `J` is set to toggle whether or not to enable the automatic-emergency-stop hack. `F8`
is set to trigger the jump-throw action.
(The effect of automatic-emergency-stop while repeeking is not good， it is recommended to disable it by pressing J)

You can execuate `npm run start:node` or `npm run start:bun` to run `index.js` with **node** or **bun**.

```javascript
async function listen() {
  //...
  while (state.listening) {
    const device = await interception.wait();
    const stroke = device?.receive();

    if (!state.listening || !device || !stroke || (stroke?.type === "keyboard" && stroke.code === SCANCODE_ESC)) break;

    device.send(stroke);
    recordKeyState(stroke);
    //...
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
  }

  interception.destroy();
  logger.warn(chalk.yellow("Disconnected"));
}
```

## Exception

If you encounter the following error:

- script is running, but hack is not working, maybe the device used is not the one actually used in the game.
  - You can check the device by `console.log(device)` in the handler to know which device in devices is used.
- script is running as well as hack, but the output action is not as expected, maybe the key-binding at your machine is different from the example codes.
  - You can run the `check.js` to check the key-binding, and update the `key_codes` and `mouse_codes` yourself.
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
