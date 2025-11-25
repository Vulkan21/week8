import express from 'express';
import bodyParser from 'body-parser';
import { createReadStream } from 'fs';
import crypto from 'crypto';
import http from 'http';
import cors from 'cors';
import { writeFileSync } from 'fs';
import createApp from './app.js';

const app = createApp(express, bodyParser, createReadStream, crypto, http, cors, writeFileSync);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});

