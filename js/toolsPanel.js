LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', 6, 95, 225, 250);
  LT.toolsPanel.tabs = new LT.Tabs(LT.toolsPanel, ['Pieces', 'Fog', 'Tiles'])
  LT.element('a', {}, LT.toolsPanel.content, 'hey');
};
