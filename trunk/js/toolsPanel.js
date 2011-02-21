LT.loadSwatches = function (){
  while(LT.tilesTab.firstChild){
    LT.tilesTab.removeChild(LT.tilesTab.firstChild);
  }
  for( var i = 0 ; i < LT.images.length; i++ ){
      newImage = LT.element('img', { style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
	    src : 'images/upload/tile/' + LT.images[i].file}, LT.tilesTab);
	  newImage.id = LT.images[i].id;
	  newImage.file = LT.images[i].file;
	  newImage.onclick = function() {
	    LT.selectedImageID = this.id;
        LT.selectedImage = this.file;
	  }
    }
}

LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', 6, 95, 225, 250);
  LT.toolsPanel.tabs = new LT.Tabs(LT.toolsPanel, ['Tiles', 'Pieces', 'Fog'])
  LT.piecesTab = LT.toolsPanel.tabs.tab[1].content;
  LT.fogTab = LT.toolsPanel.tabs.tab[2].content;
  LT.tilesTab = LT.toolsPanel.tabs.tab[0].content;
  LT.element('div', {}, LT.piecesTab, "HEY");
  LT.element('div', {}, LT.fogTab, "YOU");
  // POPULATE THE TILES TAB
  
  //LT.loadSwatches();
  //var my_uploader = new LT.Uploader("create_image.php", LT.toolsPanel.content);
  //my_uploader.setArgument("type", "tile");
};

