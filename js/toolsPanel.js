LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', 6, 95, 225, 250);
  LT.toolsPanel.tabs = new LT.Tabs(LT.toolsPanel, ['Pieces', 'Fog', 'Tiles'])

  //var my_uploader = new LT.Uploader("create_image.php", LT.toolsPanel.content);
  //my_uploader.setArgument("type", "tile");
};

