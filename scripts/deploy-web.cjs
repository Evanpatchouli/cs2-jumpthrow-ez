const fs = require('fs');
const path = require('path');

const NGINX_HOME = process.env.NGINX_HOME;
const sourceDir = path.resolve(__dirname, '../server', 'public');
const targetDir = path.resolve(NGINX_HOME, 'html', 'di-monitor');

// 删除目标文件夹
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log(`Deleted folder: ${targetDir}`);
}

// 复制文件夹
const copyFolderSync = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

copyFolderSync(sourceDir, targetDir);
console.log(`Copied folder from ${sourceDir} to ${targetDir}`);