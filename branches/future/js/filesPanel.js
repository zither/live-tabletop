$(function () { // This anonymous function runs after the page loads.
	LT.filesPanel = new LT.Panel("filesPanel");
	var uploader = new LT.Uploader("php/create_image.php",
		$(".panel.filesPanel .panelContent")[0]);
	$(uploader.form).append($("#uploadImage").remove().children());
//	uploader.form.onsubmit = function () {alert("sending");};
//	uploader.onload = function (result) {alert(result);};
});

