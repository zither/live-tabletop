
LT.createUserPanel = function () {  
  LT.userButton = LT.element('div', { id : 'loginDiv' });
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 210, 100, LT.userButton);
  
  LT.userPanel.makeTab('Options');
  LT.userPanel.makeTab('Edit User');
  LT.userPanel.makeTab('Add User');
  LT.myOptionsTab = LT.userPanel.tabs[0];
  LT.userListTab = LT.userPanel.tabs[1];
  LT.adminTab = LT.userPanel.tabs[2];
  
  LT.element('a', {id: 'logoutDiv'}, LT.myOptionsTab.content, 'Logout').onclick = LT.logout;
  
  LT.element('div', {'class': 'separator'}, LT.myOptionsTab.content);
  
  createImagesButton = LT.element('a', {}, LT.myOptionsTab.content, 'Process Uploaded Images');
  createImagesButton.onclick = function () {
    LT.processImages();
  }
  LT.element('div', {'class': 'separator'}, LT.myOptionsTab.content);
  
  defaultPanels = LT.element('a', {}, LT.myOptionsTab.content, 'Default Panels');
  defaultPanels.onclick = function () {
    LT.tablesPanel.refreshPanel();
    LT.chatPanel.refreshPanel();
    LT.turnsPanel.refreshPanel();
    LT.piecesPanel.refreshPanel();
    LT.filesPanel.refreshPanel();
    LT.userPanel.refreshPanel();
  }
  populateAdminTab();
  populateUserEditTab();
}

populateAdminTab = function () {
  LT.userForm = LT.element('form', { }, LT.adminTab.content);
  LT.inputUserName = LT.element('input', { size : 8, type: 'text' }, LT.userForm, 'User Name', 1);
  LT.inputPassword = LT.element('input', { size : 8 }, LT.userForm, 'Password', 1);
  userSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.userForm);
  userSubmit.onclick = function() { LT.createUser(); };
}

populateUserEditTab = function () {
  LT.uL = LT.element('form', {}, LT.userListTab.content);
  
  LT.uL.userSelect = LT.element('select', { size : 1, name : 'userSelect', 
    style : 'width: 100px;' }, LT.uL);
  LT.uL.nameDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.uL, 'Name: ');
  LT.uL.nameInput = LT.element('input', { size : 8, type: 'text',
    }, LT.uL.nameDiv);
}

LT.refreshUsersList = function () {
  LT.fill(LT.uL.userSelect)
  LT.fill(LT.Piece.creator.userSelect)
  LT.fill(LT.Piece.editor.userSelect)
  for ( i = 0; i < LT.users.length; i++) {
    var option = LT.element('option', {value : i}, LT.uL.userSelect,
      LT.users[i].name);
	option.onclick = function() {selectOption(LT.uL.userSelect.value);};
    var cPOption = LT.element('option', {value : i}, LT.Piece.creator.userSelect,
      LT.users[i].name);
	if ( LT.users[i].id == LT.currentUser.id ) {
	    cPOption.setAttribute('selected', 'select');
	}
    LT.element('option', {value : i}, LT.Piece.editor.userSelect,
      LT.users[i].name);
  }
  LT.uL.nameInput.value = LT.users[LT.uL.userSelect.value].name;
}
selectOption = function (userID) {
  var user = LT.users[userID];
  LT.uL.nameInput.value = user.name;
}
