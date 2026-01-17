const express = require('express');
var fs = require('fs');
const path = require('path');
var https = require('https');
const api = require('./api');
const app = express();

const httpPort = process.env.PORT || 4000;
const httpsPort = process.env.HTTPS_PORT || 4443;
const enableHttps = String(process.env.ENABLE_HTTPS || '').toLowerCase() === 'true';

app.use(express.json());

// Backend API (auth, tasks, characters, user settings)
app.use('/api', api);

// Serve the frontend from the repo's /public folder.
// Using an absolute path avoids "Cannot GET /" when starting node from /server.
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Be explicit about the homepage.
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(httpPort, () => {
    console.log('Server started at http://localhost:%s', httpPort);
});

if (enableHttps) {
    const keyPath = path.join(__dirname, 'server.key');
    const certPath = path.join(__dirname, 'server.cert');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        https
            .createServer({
                    key: fs.readFileSync(keyPath),
                    cert: fs.readFileSync(certPath),
                },
                app
            )
            .listen(httpsPort, () => {
                console.log('Server started at https://localhost:%s', httpsPort);
            });
    } else {
        console.warn(
            'ENABLE_HTTPS=true but missing server.key/server.cert; skipping HTTPS listener.'
        );
    }
}