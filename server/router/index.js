import e from "express";
import * as core from '../../core/index.js';
import Resp from '../model/resp.js';

const router = e();

router.get('/api', (req, res) => {
  res.send(Resp.ok("Welcome to Device Interception Server!"));
})

router.get('/api/status', (req, res) => {
  res.send(Resp.ok('success', 0, core.listening));
});

router.post('/api/stop', (req, res) => {
  core.setListening(false);
  res.send(Resp.ok("Server stopped."));
})

export default router;