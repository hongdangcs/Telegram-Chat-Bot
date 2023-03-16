const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const fs = require("fs");
const screenshot = require("./screenshot");
let window;

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.loadFile("Stock/index.html");
  window.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("start::screenshot", (event, arg, filename) => {
  console.log("Starting");
  screenshot(arg, filename, (reply) => {
    console.log("Done", reply);
  });
});