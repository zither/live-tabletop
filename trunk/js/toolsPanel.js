
LT.loadSwatches = function (){
  while(LT.tilesTab.firstChild){
    LT.tilesTab.removeChild(LT.tilesTab.firstChild);
  }
  var imagesArray = LT.sortObject(LT.images, 'file');
  for( var i = 0 ; i < imagesArray.length; i++ ){
    newImage = LT.element('img', { title : imagesArray[i].file, 
	  style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
	  src : 'images/upload/tile/' + imagesArray[i].file}, LT.tilesTab);
	newImage.id = imagesArray[i].id;
	newImage.file = imagesArray[i].file;
	newImage.onclick = function() {
	  LT.selectedImageID = this.id;
      LT.selectedImage = this.file;
	}
  }
}

LT.loadPieces = function (){
  var readPieces = LT.ajaxRequest("POST", "php/read_pieces.php",{ 'type' : 'tile'});
  if (readPieces.responseXML){
    var imageElements = readPieces.responseXML.getElementsByTagName('image');
    LT.images = {};
    for( var i = 0 ; i < imageElements.length; i++ ){
      var image = new LT.Image(imageElements[i]);
	  LT.images[image.id] = image;
    //  LT.images.push(image);
    }
  }
}

LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', 6, 95, 210, 110);
  LT.toolsPanel.tabs = new LT.Tabs(LT.toolsPanel, ['Tiles', 'Pieces', 'Fog']);
  LT.piecesTab = LT.toolsPanel.tabs.tab[1].content;
  LT.fogTab = LT.toolsPanel.tabs.tab[2].content;
  LT.tilesTab = LT.toolsPanel.tabs.tab[0].content;
  LT.element('div', {}, LT.piecesTab, "HEY");
  LT.element('div', {}, LT.fogTab, "YOU");
};

