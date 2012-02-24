LT.createUserPanel = function () {  
  LT.userButton = LT.createElement({id: 'loginDiv'});
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 210, 100, LT.userButton);
  
  // options tab
  var optionsTab = LT.userPanel.makeTab('Options');
  var logout = LT.createElement(optionsTab.content, 'a', {id: 'logoutDiv'}, ['Logout']);
  logout.onclick = LT.logout;
  LT.createElement(optionsTab.content, {'class': 'separator'});
  var createImagesButton = LT.createElement(optionsTab.content, 'a', ['Process Uploaded Images']);
  createImagesButton.onclick = LT.processImages;
  LT.createElement(optionsTab.content, {'class': 'separator'});
  var defaultPanels = LT.createElement(optionsTab.content, 'a', ['Default Panels']);
  defaultPanels.onclick = function () {
    LT.tablesPanel.refreshPanel();
    LT.chatPanel.refreshPanel();
    LT.turnsPanel.refreshPanel();
    LT.piecesPanel.refreshPanel();
    LT.filesPanel.refreshPanel();
    LT.userPanel.refreshPanel();
  }

  // edit user tab
  var editUserTab = LT.userPanel.makeTab('Edit User');
  LT.editUserSelect = LT.createElement(editUserTab.content, 'select',
    {size : 1, name: 'userSelect', style: {width: '100px'}});
  LT.editUserInput = LT.createElement('input', {size: 8, type: 'text'});
  LT.createElement(editUserTab.content, {'class' : 'inputDiv'}, ['Name: ', LT.editUserInput]);
  var editUserPalette = new LT.Palette(null, editUserTab.content, 5);

  // add user tab
  var addUserTab = LT.userPanel.makeTab('Add User');
  var addUserName = LT.textInput(addUserTab.content, {size: 8}, 'User Name');
  var addUserPassword = LT.textInput(addUserTab.content, {size: 8}, 'Password');
  var addUserPalette = new LT.Palette(null, addUserTab.content, 5);
  var addUserSubmit = LT.createElement(addUserTab.content, 'input', 
    {type: 'button', style: 'cursor: pointer', id: 'chatSubmit', size: 8, value: 'Create'});
  addUserSubmit.onclick = function () {
    LT.ajaxRequest("POST", "php/create_user.php", {
      username: addUserName.value,
      permissions: 'user',
      password: addUserPassword.value,
      color: addUserPalette.getColor(),
    });
  };
}

LT.refreshUsersList = function () {
  LT.fill(LT.editUserSelect)
  LT.fill(LT.Piece.creator.userSelect)
  LT.fill(LT.Piece.editor.userSelect)
  for (var i = 0; i < LT.users.length; i++) {
    var option = function (theParent) {
      return LT.createElement(theParent, 'option', {value: i}, [LT.users[i].name]);
    }
    var editUserOption = option(LT.editUserSelect);
    editUserOption.onclick = function () {
      LT.editUserInput.value = LT.users[LT.editUserSelect.value].name;
    };
    var pieceCreatorOption = option(LT.Piece.creator.userSelect);
    if (LT.users[i].id == LT.currentUser.id) {
      pieceCreatorOption.setAttribute('selected', 'selected');
    }
    var pieceEditorOption = option(LT.Piece.editor.userSelect);
  }
  LT.editUserInput.value = LT.users[LT.editUserSelect.value].name;
}

