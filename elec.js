const { app } = require('electron')

app.on('ready', () => {
  console.log(process.versions.node) // prints the version of Node.js used by Electron
})