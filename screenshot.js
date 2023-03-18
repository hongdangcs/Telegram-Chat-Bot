const {BrowserWindow} = require("electron");
const fs = require("fs");
const path = require("path");
// Offscreen BrowserWindow
let offscreenWindow;
let nativeImage;
// Exported readItem function
module.exports = (url, filename, callback) => {
    // Create offscreen window
    offscreenWindow = new BrowserWindow({
        width: 1280,
        height: 1080,
        show: false,
        webPreferences: {
            offscreen: true,
        },
    });

    // Load item url
    offscreenWindow.loadURL(url);

    // Wait for content to finish loading
    offscreenWindow.webContents.on("did-stop-loading", async () => {
        // Get screenshot (thumbnail)
        nativeImage = await offscreenWindow.webContents
            .capturePage()
            .then((image) => {
                fs.writeFileSync(filename, image.toPNG(), (err) => {
                    if (err) throw err;
                });
                return image.toDataURL();
            });
        let obj = {title: "screenshot", url: "google.com", filename};
        callback(obj);
        offscreenWindow.close();
        offscreenWindow = null;
    });
};