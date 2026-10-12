# dater

A local-only date-range tracker. Daters and notes stay in IndexedDB on your device.

## Development

```sh
npm ci
npm run dev
```

## Production and offline support

```sh
npm run build
npm start
```

The Next.js app is statically exported to `out/`. The build then generates
`out/sw.js` from **every exported file**, including the HTML shell, JavaScript
chunks, CSS, self-hosted EB Garamond fonts, manifest, and icons. This keeps the
existing design and requires no application server or runtime CDN.

Visit once over HTTPS (or localhost) and leave the page open until the service
worker finishes installing. It caches the whole build before taking control.
After that, reloads and fresh launches of `/` work without a network, including
URLs with query strings. Creating/deleting daters and adding/deleting notes
remain local. Development mode does not register a worker.

Each build gets a content-derived cache name. Updates install into a separate
cache and wait until the old tabs close, so an open app never mixes its shell
with a different build's chunks. On activation, the worker removes only older
`dater-shell-` caches. It never changes IndexedDB. Reconnecting checks for a
worker update.

There is no time-based cache expiry. A first-ever visit still needs internet,
and no website can promise storage forever: clearing site data, uninstalling,
private browsing, or browser/OS eviction can remove the shell and local data.
The app already requests persistent storage where the browser supports it.

## Offline regression tests

```sh
npm --prefix tests ci
npm --prefix tests exec -- playwright install --with-deps chromium webkit
npm run test:offline
```

Tests serve the actual production export, wait for service-worker control, and
assert that every exported asset was cached. They create a dater through the UI,
disable the network (and Chromium's HTTP cache), reload, add a note, close and
reopen a tab offline, create/delete another dater offline, and verify data after
another reload. Mobile-sized screenshots are saved under `test-results/`.
