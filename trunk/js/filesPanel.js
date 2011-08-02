LT.createFilesPanel = function () {
  LT.filesPanel = new LT.Panel( 'Files', 'Files', 6, 118, 250, 150);
  
  var my_uploader = new LT.Uploader("php/create_image.php", LT.filesPanel.content);
  LT.element("input", {type:"radio", name:"type", value:"piece", checked:""}, 
    LT.element('div', {}, my_uploader.form, "Piece"));
  LT.element("input", {type:"radio", name:"type", value:"tile"}, 
    LT.element('div', {}, my_uploader.form, "Tile"));
  LT.element("input", {type:"radio", name:"type", value:"background"},
    LT.element('div', {}, my_uploader.form, "Background"));
  LT.element("input", {type:"submit", value:"upload"}, my_uploader.form);

/*
  my_uploader.form.onsubmit = function () {
    alert('sending');
  }
*/

/*
  my_uploader.onload = function (result) {
    alert(result);
  }
*/
};

