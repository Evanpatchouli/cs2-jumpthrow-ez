import e from "express";
import * as core from '../../core/index.js';
import Resp from '../model/resp.js';

const router = e();

router.get('/', (req, res) => {
  res.send(Resp.ok("Welcome to Device Interception Server!"));
})

router.get('/status', (req, res) => {
  res.send(Resp.ok('success', 0, core.isListening()));
});

router.post('/start', (req, res) => {
  core.start();
  res.send(Resp.ok("监听启用"));
})

router.post('/stop', (req, res) => {
  core.stop();
  res.send(Resp.ok("监听暂停"));
})

export default router;