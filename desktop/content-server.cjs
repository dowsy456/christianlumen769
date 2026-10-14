'use strict';
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');

function resolveContentPath(root, url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'chatapp:' || parsed.hostname !== 'app' || parsed.port || parsed.username || parsed.password) return null;
  let pathname;
  try { pathname = decodeURIComponent(parsed.pathname); } catch { return null; }
  if (pathname.includes('\\') || pathname.includes('\0') || pathname.includes(':')) return null;
  const relative = pathname.replace(/^\/+/, '') || 'index.html';
  const result = path.resolve(root, relative);
  const base = path.resolve(root) + path.sep;
  return result.startsWith(base) ? result : null;
}

function createContentHandler(getRoot, net) {
  return async request => {
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    const root = getRoot();
    if (!root) return new Response('App is starting', { status: 503 });
    const file = resolveContentPath(root, request.url);
    if (!file) return new Response('Not found', { status: 404 });
    try {
      const stat = await fs.stat(file);
      if (!stat.isFile()) return new Response('Not found', { status: 404 });
      const response = await net.fetch(pathToFileURL(file).href, { method: request.method, headers: request.headers });
      // The same chatapp URL can point to a new GitHub release after restart.
      // Never let a prior release's CSS/JS shadow the selected shared web files.
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-store');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  };
}

function isSignedB2UploadURL(value) {
  try {
    const url = new URL(value);
    const host = /^s3\.([a-z0-9-]+)\.backblazeb2\.com$/.exec(url.hostname);
    if (url.protocol !== 'https:' || !host || url.port || url.username || url.password || url.hash) return false;
    if (!/^\/[A-Za-z0-9-]{6,63}\/(attachments|html)\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(url.pathname)) return false;
    const values = {};
    for (const name of ['Algorithm', 'Credential', 'Date', 'Expires', 'SignedHeaders', 'Signature']) {
      const matches = url.searchParams.getAll('X-Amz-' + name);
      if (matches.length !== 1) return false;
      values[name] = matches[0];
    }
    const scope = /^[^/\s]{1,256}\/(\d{8})\/([a-z0-9-]+)\/s3\/aws4_request$/.exec(values.Credential);
    return values.Algorithm === 'AWS4-HMAC-SHA256' && !!scope && scope[2] === host[1] &&
      /^\d{8}T\d{6}Z$/.test(values.Date) && values.Date.startsWith(scope[1]) &&
      /^\d{1,6}$/.test(values.Expires) && Number(values.Expires) > 0 && Number(values.Expires) <= 604800 &&
      /^[a-fA-F0-9]{64}$/.test(values.Signature) &&
      /^(?:[a-z0-9-]+;)*host(?:;[a-z0-9-]+)*$/.test(values.SignedHeaders);
  } catch { return false; }
}

function isAppMainFrameRequest(details, contents) {
  try {
    if (!contents || contents.isDestroyed() || details.webContentsId !== contents.id ||
      details.webContents !== contents || details.frame !== contents.mainFrame ||
      details.initiatorOrigin !== 'chatapp://app') return false;
    const url = new URL(contents.getURL());
    return url.protocol === 'chatapp:' && url.host === 'app' && !url.username && !url.password;
  } catch { return false; }
}

function configureB2UploadCors(ses, getContents) {
  // B2 answers a custom-scheme Origin with "null", even when the bucket's CORS
  // rule allows uploads. Correct that one response header for the app's signed
  // uploads; retain Chromium's normal security and every other server header.
  ses.webRequest.onHeadersReceived({ urls: ['https://*.backblazeb2.com/*'] }, (details, callback) => {
    if (!['PUT', 'OPTIONS'].includes(details.method) || !isSignedB2UploadURL(details.url) ||
      !isAppMainFrameRequest(details, getContents())) return callback({});
    const headers = details.responseHeaders || {};
    const names = Object.keys(headers).filter(name => name.toLowerCase() === 'access-control-allow-origin');
    if (names.length !== 1) return callback({});
    const name = names[0], values = headers[name];
    if (!Array.isArray(values) || values.length !== 1 || values[0] !== 'null') return callback({});
    callback({ responseHeaders: { ...headers, [name]: ['*'] } });
  });
}

module.exports = { resolveContentPath, createContentHandler, isSignedB2UploadURL, configureB2UploadCors };
