$(function () { // This anonymous function runs after the page loads.
	$("#installBox input[type=button]").click(function () {
		var formData = $("#installBox").serialize();
		if (formData.admin_password != formData.retype_password) {
			alert("Admin passwords do not match.");
			return false;
		}
		$.post("php/logout.php", function () {
			$.post("php/install.php", formData, function () {
				$.post("php/db_config.php", function () {
					$.post("php/login.php", {
						username: formData.admin_username,
						password: formData.admin_password,
					});
					LT.processImages();
					$("#installBox").hide();
					$("#map, #pageBar").show();
					LT.loginCheck();
					LT.tablesPanel.show();
				}).fail(function () {
					alert("Database was not properly installed. Try again.");		
				});
			});
		});
	});
});

