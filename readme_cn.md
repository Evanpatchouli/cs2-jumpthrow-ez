# Device Interception

一个处理设备方向和运动事件的 javascript 脚本。

## 免责申明

<font color="red">警告！本项目仅用于学习和交流，请勿在游戏中使用，您有可能被 VAC 封禁！如果您为此遭到封禁，我方概不负责!</font>

## 示例用法

在下面的示例代码中，应用了 CS2 中的急停和一些投掷操作，`J` 被设置为切换是否启用急停辅助。`F7` 被设置为触发跳投动作。
（在 repeek 期间急停效果不佳，建议按 J 禁用）

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

## 异常

如果你遇到以下异常：

- 脚本正在运行，但辅助没有生效，可能使用的设备不是实际游戏中使用的设备。
  - 你可以在处理程序中使用 `console.log(device)` 来查看是否是 devices 中使用的设备。
- 脚本正在运行，辅助也生效了，但输出的动作不如预期，可能你的机器上的按键绑定与示例代码不同。
  - 你可以运行 `check.js` 来查看按键绑定，然后手动更新 `key_codes` 和 `mouse_codes`。
- 脚本被终止，可能是被游戏的反作弊系统杀死了。
  - 对于这种情况，最好不要在游戏中运行此脚本。因为这可能导致你被游戏封号。
