/*
  Title: RQ_Apprepend.jsx
  Version: 1.0.0
  Desc: Batch append/prepend text to the current output filename of all QUEUED render items.
  Author: gfxhacks.com
*/

{

  function ApprependSetup(thisObj) {
    var apprependSetupData = new Object();

    apprependSetupData.scriptName = "RQ Apprepend";
    apprependSetupData.version = "1.0.0";
    apprependSetupData.sourceUrl = "https://gfxhacks.com";
    apprependSetupData.scriptDesc = "Batch append/prepend text to the current output filename of all QUEUED render items.";

    apprependSetupData.strAppendBtn = "Append";
    apprependSetupData.strPrependBtn = "Prepend";
    apprependSetupData.strInfoBtn = "i";

    apprependSetupData.strErrMinAE90 = "This script requires Adobe After Effects CS4 or later.";

    /**
      * Function for creating the user interface
    */
    function apprependSetup_buildUI(thisObj) {
      // setup palette window if of type Panel.
      var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", apprependSetupData.scriptName, undefined, {
        resizeable: true
      });

      if (pal != null) {
        var res =
        """group {
        orientation: 'column', alignment: ['fill', 'fill'],
          input: EditText {
            alignment: ['fill', 'top'],
            preferredSize: [150, -1]
          },
          buttons: Group {
            alignment: ['fill', 'top'],
            infoBtn: Button {
              text: '"""+apprependSetupData.strInfoBtn+"""',
              alignment: ['left', 'top'],
              preferredSize: [25, -1]
            },
            prependBtn: Button {
              text: '"""+apprependSetupData.strPrependBtn+"""',
              alignment: ['fill', 'top'],
              preferredSize: [50, -1]
            },
            appendBtn: Button {
              text: '"""+apprependSetupData.strAppendBtn+"""',
              alignment: ['fill', 'top'],
              preferredSize: [50, -1]
            },
          }

      }""";
      pal.margins = [10, 10, 10, 10];
      pal.grp = pal.add(res);

      pal.grp.buttons.infoBtn.onClick = info;
      pal.grp.buttons.prependBtn.onClick = prepend;
      pal.grp.buttons.appendBtn.onClick = append;

      pal.layout.layout(true);
      pal.layout.resize();
      pal.onResizing = pal.onResize = function() {
        this.layout.resize();
      }
    }
    return pal;

  }

  function info() {
    alert(
      apprependSetupData.scriptName + " - " +
      apprependSetupData.version + "\n" +
      apprependSetupData.scriptDesc + "\n\n" +
      apprependSetupData.sourceUrl
    );
  }

  function prepend() {
    var prependStr = this.parent.parent.input.text;
    if (prependStr.length > 0) {
      apprependRQItems(prependStr, "");
    }
  }

  function append() {
    var appendStr = this.parent.parent.input.text;
    if (appendStr.length > 0) {
      apprependRQItems("", appendStr);
    }
  }

  /**
    * Callback function for creating the actual folder structure
  */
  function apprependRQItems(prependStr, appendStr) {
    app.beginUndoGroup(apprependSetupData.scriptName);

    var rqItems = app.project.renderQueue.items;
    var rqItemsNum = app.project.renderQueue.numItems;
    var rqQueuedItemsNum = 0;

    if (rqItemsNum > 0) {
      for (i = 1; i <= rqItemsNum; i++) {
        if (rqItems[i].status == RQItemStatus.QUEUED) {
          rqQueuedItemsNum++;
          var om1 = app.project.renderQueue.item(i).outputModule(1);
          var fullFileName = File.decode(om1.file.name);
          var fileName = fullFileName.replace(/\.[^\.]+(?=\/$|$)/, '');
          var fileExt = fullFileName.match(/\.[^\.]+(?=\/$|$)/)[0];
          var filePath = om1.getSettings(GetSettingsFormat.STRING)["Output File Info"]["Base Path"];
          om1.file = new File(filePath + '/' + prependStr + fileName + appendStr);
        }
      }
      if (rqQueuedItemsNum == 0) alert('No QUEUED items in render queue');
    } else {
      alert('No Items in Render Queue');
    }

    app.endUndoGroup();
  }

  /**
    * Main:
  */

  if (parseFloat(app.version) < 9) {
    alert(apprependSetupData.strErrMinAE90, apprependSetupData.scriptName);
    return;
  } else {
    var fsPal = apprependSetup_buildUI(thisObj);
    if (fsPal != null) {
      // Use the last input text (saved in the After Effects preferences file), if it exists
      if (app.settings.haveSetting("Adobe", "apprependSetup_input")) {
        fsPal.grp.input.text = app.settings.getSetting("Adobe", "apprependSetup_input").toString();
      }

      // Save current input text upon closing the palette
      fsPal.onClose = function() {
        app.settings.saveSetting("Adobe", "apprependSetup_input", fsPal.grp.input.text);
      }

      if (fsPal instanceof Window) {
        fsPal.center();
        fsPal.show();
      } else
        fsPal.layout.layout(true);
    }
  }
}
// alert('test ok');
ApprependSetup(this);
}
