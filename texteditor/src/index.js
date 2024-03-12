const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenu(createMainMenu());

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

ipcMain.on("save-content", (event, content) => {
  dialog.showSaveDialog({
    title: "Save File",
    defaultPath: "new text.txt", // default name for the file
    filters: [{
      name: "text files",
      extensions: ["txt"] // filter for text files
    }]
  }).then((result) => {
    if (!result.canceled) {
      fs.writeFile(result.filePath, content, "utf-8", (err) => {
        if (err) {
          dialog.showErrorBox("Error saving file", `There was an unexpected error saving the file: ${err}`)
        } else {
          dialog.showMessageBox({
            title: "Success",
            message: "Success saving the file"
          })
        }
      }).catch((err) => {
        dialog.showErrorBox("Error saving file", `There was an unexpected error saving the file: ${err}`)
      })
    }
  })
})

function openFile() {
  dialog.showOpenDialog({
    title: "Open file",
    filters: [{
      name: "text files",
      extensions: ["txt"]
    }]
  }).then((result) => {
    if (!result.canceled && result.filePaths.length >= 1) {
        fs.readFile(result.filePaths[0], "utf-8", (err, data) => {
        if (err) {
          dialog.showErrorBox("Error opening file", `There was an error opening the file: ${err}`);
        } else {
          mainWindow.webContents.send("file-opened", data);
        }
      })
    }
  }).catch((err) => {
    dialog.showErrorBox("Error opening file", `There was an error opening the file: ${err}`);
  })
}

function createMainMenu() {
  const mainMenu = [
    {
      label: "File",
      submenu: [
        {
          label: "Open file",
          accelerator: "CmdorCtrl+O",
          click: () => {
            openFile();
          },
        }
      ]
    },
    {
      label: "Exit",
      click: () => {
        app.quit();
      }
    }
  ]
  return Menu.buildFromTemplate(mainMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
