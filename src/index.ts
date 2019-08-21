import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { IFileBrowserFactory } from "@jupyterlab/filebrowser";

import { HerokuWidget } from "./widget";
import { Heroku } from "./heroku";

import "../style/index.css";

const EXTENSION_ID = "jupyterlab-heroku";

/**
 * Initialization data for the jupyterlab-heroku extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, fileBrowserFactory: IFileBrowserFactory) => {
    const { commands } = app;
    let heroku = new Heroku(fileBrowserFactory);

    const runInTerminal = async (cmd: string) => {
      const terminalWidget = await commands.execute("terminal:create-new");
      app.shell.add(terminalWidget, "main", { mode: "split-right" });

      const terminal = terminalWidget.content;
      try {
        terminal.session.send({
          type: "stdin",
          content: [cmd + "\n"]
        });
        return terminalWidget;
      } catch (e) {
        console.error(e);
        terminalWidget.dispose();
      }
    };

    let widget = new HerokuWidget({ heroku, runInTerminal });
    widget.id = "jp-heroku";
    widget.title.iconClass = "jp-SideBar-tabIcon jp-HerokuIcon";
    widget.title.caption = "Heroku";
    app.shell.add(widget, "left");
  }
};

export default extension;
