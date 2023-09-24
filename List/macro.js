/** @OnlyCurrentDoc */

function trux() {
    let spreadsheet = SpreadsheetApp.getActive();
    
    spreadsheet.insertSheet(spreadsheet.getNumSheets());
    let supersheet = spreadsheet.getActiveSheet();
    supersheet.setName("all")
    supersheet.insertRowsAfter(supersheet.getMaxRows(), 1000);
    let superIndex = 1
    spreadsheet.getSheets().forEach((sheet)=>{
      let nameList = sheet.getName()
      let index=6
      while(sheet.getRange('A'+index).getValue()!="" && nameList != "all"){
        sheet.getRange('B' + index + ':D' + index).copyTo(supersheet.getRange('A'+superIndex), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
        supersheet.getRange('D'+superIndex).setValue(nameList)
        superIndex++
        index++
      }
    })
  };