# Device Listener

<font color="red">警告! 您可能因此被 VAC 封禁!</font>

一个处理设备方向和运动事件的 javascript 脚本。

在 `index.js` 中的示例代码是实现 _Counter-Strike 2_ 中的自动急停和 F8 跳投功能。

## 用法

在下面的示例代码中，应用了 `jiting` 和 `jumpThrow`，`J` 被设置为切换是否启用急停辅助。`F8` 被设置为触发跳投动作。
（不过由于代码执行带来的时间差自动急停的效果不怎么样）

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

## 异常

如果你遇到以下异常：

- 脚本正在运行，但辅助没有生效，可能使用的设备不是实际游戏中使用的设备。
  - 你可以在处理程序中使用 `console.log(device)` 来查看是否是 devices 中使用的设备。
- 脚本正在运行，辅助也生效了，但输出的动作不如预期，可能你的机器上的按键绑定与示例代码不同。
  - 你可以运行 `prepare.js` 来重新收集按键绑定以覆盖 `key_codes` 和 `mouse_codes`。
- 脚本被终止，可能是被游戏的反作弊系统杀死了。
  - 对于这种情况，最好不要在游戏中运行此脚本。因为这可能导致你被游戏封号。
