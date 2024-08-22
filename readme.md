# Device Listener

<font color="red">Warning! You might got banned by VAC for this!</font>
A javascript to handle device orientation and motion events.

The example code at `index.js` is to realize the functions of cfgs in _Counter-Strike 2_ of stop-automatic and jump-throw.

## Usage

In example codes below, `jiting` and `jumpThrow` are applied, and `J` is set to toggle whether or not to enable the stop-automatic hack. `F8`
is set to trigger the jump-throw action.
(But the effect of automatic emergency stop is not good due to the duration of code execution.)

```javascript
async function listen() {
  //...
  while (state.listening) {
    const device = await interception.wait();
    const stroke = device?.receive();

    if (!state.listening || !device || !stroke || (stroke?.type === "keyboard" && stroke.code === SCANCODE_ESC)) break;

    device.send(stroke);
    //...
    concurrentify(
      // Add your handler below  往下添加附作用事件
      jiting(stroke, input, "J"),
      jumpThrow(stroke, input, "F8"),
      forwardjumpThrow(stroke, input, "F9")
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
  - You can run the `prepare.js` to recollect the key-binding to override the `key_codes` and `mouse_codes`.
- script is terminated, maybe it is killed by the anti-hack system of the game.
  - For this case, you'd better not to run this script in the game. Because it may cause you to be banned by the game.
