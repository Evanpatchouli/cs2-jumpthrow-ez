# Device Interception Example

<p align="left">
  <a href="#"><img alt="github" src="https://img.shields.io/badge/Github-grey.svg"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/license-LGPL3-green.svg"></a>
  <a href="#"><img alt="platform" src="https://img.shields.io/badge/os-windows_11-blue.svg"></a>
  <a href="#"><img alt="NodeJS" src="https://img.shields.io/badge/NodeJS-16+-green.svg"></a>
  <a href="#"><img alt="CS:GO" src="https://img.shields.io/badge/CS:GO-black.svg"></a>
</p>

一个 **windows** 上捕获键盘和鼠标输入的 Node.js 示例程序。

## 免责申明

<font color="red">警告！本项目仅用于学习和交流，请勿在游戏中使用，您有可能被 VAC 封禁！如果您为此遭到封禁，我方概不负责!</font>

### 安装驱动

在具有**管理员权限**的命令行执行:

```cmd
npm run install:driver
```

> 之后你可以使用`npm run uninstall:driver` 来卸载驱动.

在驱动安装完成后你需要**重启**计算机。

## 示例用法

在下面的示例代码中，应用了 CS2 中的急停和一些投掷操作，`J` 被设置为切换是否启用急停辅助。`F7` 被设置为触发跳投动作。
（在 repeek 期间急停效果不佳，建议按 J 禁用）

你可以在 `npm run start:node` 或 `npm run start:bun` 在 **node** 或 **bun** 环境下执行 `index.js`。

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
