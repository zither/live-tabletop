
LT.createUserPanel = function () {
  LT.userButton = LT.element('div', { id : 'loginDiv' });
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 210, 100, LT.userButton);
  LT.element('a', {id: 'logoutDiv'}, LT.userPanel.content, 'Logout')
    .onclick = LT.logout;
  
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  
  createImagesButton = LT.element('a', {}, LT.userPanel.content, 'Process Uploaded Images');
  createImagesButton.onclick = function(){
    LT.ajaxRequest("POST", "php/create_images.php", {});
  }
  
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  
  defaultPanels = LT.element('a', {}, LT.userPanel.content, 'Default Panels');
  defaultPanels.onclick = function(){
    LT.tablesPanel.refreshPanel();
    LT.chatPanel.refreshPanel();
    LT.turnsPanel.refreshPanel();
    LT.toolsPanel.refreshPanel();
    LT.filesPanel.refreshPanel();
    LT.userPanel.refreshPanel();
  }
  LT.userForm = LT.element('form', { }, LT.userPanel.footer);
  LT.inputUserName = LT.element('input', { size : 8, type: 'text',
    style : 'border: 0px solid #CCC;' }, LT.userForm, 'User Name', 1);
  
  LT.inputPassword = LT.element('input', { size : 8, 
    style : 'border: 1px solid #CCC;' }, LT.userForm, 'Password', 1);
  
  userSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.userForm);
  userSubmit.onclick = function() { LT.createUser(); };
  userRefresh = LT.element('input',{ type : 'button' }, LT.userPanel.footer, 'Refresh');
  userRefresh.onclick = function() { LT.refreshTables(); };
}
