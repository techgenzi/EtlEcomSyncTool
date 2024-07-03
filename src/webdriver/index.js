// driverManager.js
const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')

let driver;
// driver = await new Builder().forBrowser('chrome').build();
// driver = await new Builder().withCapabilities(Capabilities.chrome()).setChromeService(service).build();
async function getDriver() {
    let service = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH)
    if (!driver) {
        driver = await new Builder().withCapabilities(Capabilities.chrome()).setChromeService(service).build();
    } else {
        console.log("Instance is there")
        try {
            if (await driver.getWindowHandle() === null) {
                console.error('Window is closed, recreating driver');
                driver = await new Builder().withCapabilities(Capabilities.chrome()).setChromeService(service).build();
            }
        } catch (err) {
            driver = await new Builder().withCapabilities(Capabilities.chrome()).setChromeService(service).build();
        }
    }
    return driver;
}

module.exports = { getDriver };