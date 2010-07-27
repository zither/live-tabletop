function populateTablesPanel() {
  LT.tablesForm = LT.element('form', { }, LT.tablesPanel.panelContent);
  LT.tableInput = LT.element('input', { size : 24, 
    style : 'border: 1px solid #CCC;', value : '<< Table Name >>' }, LT.tablesForm);
  LT.tableInput.onfocus = function(){ emptyMe(this, '<< Table Name >>') };
  LT.tableSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.tablesForm);

      LT.tableSubmit.onclick = function(){
        var createTable = LT.ajaxRequest("POST", "php/create_message.php",
          { name : LT.tableInput.value, background : 1, default_tile: 1,
		    rows : 1, colums : 1, tile_height : 1, tile_width : 1 });
		/*var messageResult = sendMessage.responseXML.getElementsByTagName('user')[0];
		if(messageResult){
          LT.chatForm.createTextNode(messageResult.getAttribute('text'));
        }else{
		  alert('return failure')
		}
*/	  }
}