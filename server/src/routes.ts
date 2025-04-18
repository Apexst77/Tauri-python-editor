/*
 * Copyright (c) Eric Traut
 * Defines endpoint routes supported by this app server.
 */

import cors, { CorsOptions } from 'cors';
import express from 'express';
import {
    getDiagnostics,
    createSession,
    closeSession,
    getHoverInfo,
    getStatus,
    getSignatureHelp,
    getCompletion,
    resolveCompletion,
    getRenameEdits,
} from './service';

const router = express.Router();
export default router;

// Configure CORS middleware.
const corsOptions: CorsOptions = {
    origin: [
        /http:\/\/localhost\:*/,
        'http://tauri.localhost', // Tauri dev server
        'http://127.0.0.1:1430', 
        'https://pyright-playground.azurewebsites.net',
        'https://pyright-play.net',
    ],
};

router.use(cors(corsOptions));

router.get('/status', (req, res) => {
    getStatus(req, res);
});

router.post('/session', (req, res) => {
    createSession(req, res);
});

router.delete('/session/:sid', (req, res) => {
    closeSession(req, res);
});

router.post('/session/:sid/diagnostics', (req, res) => {
    getDiagnostics(req, res);
});

router.post('/session/:sid/hover', (req, res) => {
    getHoverInfo(req, res);
});

router.post('/session/:sid/rename', (req, res) => {
    getRenameEdits(req, res);
});

router.post('/session/:sid/signature', (req, res) => {
    getSignatureHelp(req, res);
});

router.post('/session/:sid/completion', (req, res) => {
    getCompletion(req, res);
});

router.post('/session/:sid/completionresolve', (req, res) => {
    resolveCompletion(req, res);
});
