LT.createUserPanel = function () {  
  LT.userButton = LT.element({attributes: {id: 'loginDiv'}});
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 210, 100, LT.userButton);
  
  // options tab
  var optionsTab = LT.userPanel.makeTab('Options');
  var logout = LT.element({
    tag: 'a',
    attributes: {id: 'logoutDiv'},
    parent: optionsTab.content,
    text: 'Logout',
  })
  logout.onclick = LT.logout;
  LT.element({attributes: {'class': 'separator'}, parent: optionsTab.content});
  var createImagesButton = LT.element({
    tag: 'a',
    parent: optionsTab.content,
    text:'Process Uploaded Images',
  });
  createImagesButton.onclick = LT.processImages;
  LT.element({attributes: {'class': 'separator'}, parent: optionsTab.content});
  var defaultPanels = LT.element({
    tag: 'a',
    parent: optionsTab.content,
    text: 'Default Panels',
  });
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
  LT.editUserSelect = LT.element({
    tag: 'select',
    attributes: {size : 1, name: 'userSelect'},
    style: {width: '100px'},
    parent: editUserTab.content,
  });
  var editUserNameDiv = LT.element({
    attributes: {'class' : 'inputDiv'},
    parent: editUserTab.content,
    text: 'Name: ',
  });
  LT.editUserInput = LT.element({
    tag: 'input',
    attributes: {size: 8, type: 'text'},
    parent: editUserNameDiv,
  });
  var editUserPalette = new LT.Palette(null, editUserTab.content, 5);

  // add user tab
  var addUserTab = LT.userPanel.makeTab('Add User');
  var addUserName = LT.element({
    tag: 'input',
    attributes: {size: 8, type: 'text' },
    parent: addUserTab.content,
    text: 'User Name',
    clear: true,
  });
  var addUserPassword = LT.element({
    tag: 'input',
    attributes: {size: 8},
    parent: addUserTab.content,
    text: 'Password',
    clear: true,
  });
  var addUserPalette = new LT.Palette(null, addUserTab.content, 5);
  var addUserSubmit = LT.element({
    tag: 'input',
    parent: addUserTab.content,
    attributes: {
      type : 'button',
      style : 'cursor: pointer', 
      id : 'chatSubmit',
      size : 8,
      value : 'Create',
    },
  });
  addUserSubmit.onclick = function () {
    LT.ajaxRequest("POST", "php/create_user.php", {
      username : addUserName.value,
      permissions : 'user',
      password : addUserPassword.value,
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
      return LT.element({
        tag: 'option',
        parent: theParent,
        attributes: {value: i},
        text: LT.users[i].name,
      });
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

