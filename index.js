require('dotenv').config()
const https = require('https');
const fs = require('fs');
const AdmZip = require('adm-zip');

const { exec } = require('child_process');
const bodyParser = require('body-parser')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express')
// const ws = require('ws');
const path = require('path');
// const db = require("./src/models");
const middlewares = require('./src/middlewares/jwtMiddleware');
// const gstSocketController = require('./src/controllers/gstSocketController')

// Init app
const app = express();
const port = 3000;

// Middlewares
app.use(express.json());

/*
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Define the allowed HTTP methods
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
}));
*/
app.use(cookieParser());
app.use(middlewares.setHeaders);
app.use(bodyParser.json())

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Register routes

app.use("/api/idm", require('./src/routes/authRoutes'))
app.use("/api/portal", require('./src/routes/portalRoutes'))

const server = app.listen(port, "0.0.0.0", () => {
    console.log(`http://127.0.0.1:${port}/`);
    // Open Chrome after server starts
    if (process.env.OPEN_BROWSER === 'true') {
        exec(getOpenCommand(`http://127.0.0.1:${port}/`), (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening Chrome: ${error.message}`);
                console.error(stderr);
            } else {
                console.log(`Chrome opened successfully: ${stdout}`);
            }
        });
    }
    // Get chrome version and download 
    getChromeVersion();
});

function getChromeVersion() {
    try {
        exec('reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version', (error, stdout) => {
            if (error) {
                console.error(`Error fetching Chrome path: ${error.message}`);
                return;
            }
            const chromeVersion = stdout.split('REG_SZ')[1].trim();
            // Get installed chromedriver version
            exec('chromedriver-win64\\chromedriver.exe --version', (error, stdout) => {
                if (error) {
                    console.error(`Error fetching Chrome path: ${error.message}`);
                    return;
                }
                const chromedriverVersion = stdout.trim();
                if (chromedriverVersion.includes(chromeVersion)) {
                    console.log(`Chromedriver version: ${chromedriverVersion}`);
                    return;
                } else {
                    console.log(`Chromedriver version: ${chromedriverVersion}`);
                    const downloadUrl = `https://storage.googleapis.com/chrome-for-testing-public/${chromeVersion}/win64/chromedriver-win64.zip`;
                    downloadAndExtract(downloadUrl);
                }
            });
        });
    } catch (err) {
        console.error(`Error fetching Chrome path: ${err.message}`);
    }
}

function downloadAndExtract(downloadUrl) {
    console.log(downloadUrl)
    const fileName = 'chromedriver.zip';
    const file = fs.createWriteStream(fileName);

    https.get(downloadUrl, function (response) {
        response.pipe(file);

        file.on('finish', function () {
            file.close(() => {
                const zip = new AdmZip(fileName);
                zip.extractAllTo(/*target path*/"./", /*overwrite*/true);
                console.log('File downloaded and extracted');
            });
        });
    }).on('error', function (err) {
        fs.unlink(fileName);
        console.error(`File download failed: ${err.message}`);
    });
}

function getOpenCommand(url) {
    const platform = process.platform;

    if (platform === 'darwin') {
        return `open ${url}`;
    } else if (platform === 'win32') {
        return `start ${url}`;
    } else {
        return `xdg-open ${url}`;
    }
}