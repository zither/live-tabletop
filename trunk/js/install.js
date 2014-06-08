$(function () { // This anonymous function runs after the page loads.
	$("#installBox input[type=button]").click(function () {
		var formData = LT.formValues("#installBox");
		if (formData.admin_password != formData.retype_password) {
			alert("Admin passwords do not match.");
			return false;
		}
		$.post("php/User.logout.php", function () {
			$.post("php/install.php", formData, function () {
				$.post("php/db_config.php", function () {
					$("#installBox").hide();
					$("#map, #pageBar").show();
					LT.userPanel.show(); // show create account form (User panel help tab)
				}).fail(function () {
					alert("Database was not properly installed. Try again.");		
				});
			});
		});
	});
});

