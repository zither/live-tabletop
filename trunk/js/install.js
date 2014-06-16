$(function () { // This anonymous function runs after the page loads.

	// installer submit button
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
					$("#welcome").show();
				}).fail(function () {
					alert("Database was not properly installed. Try again.");		
				});
			});
		});
	});

	// automatic install
	if (window.location.search.length > 1) {
		// get args from URL
		var args = {}
		var pairs = window.location.search.substr(1).split("&");
		for (var i = 0; i < pairs.length; i++) {
			var parts = pairs[i].split("=");
			args[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
		}
		// fill out form
		$("#installBox input[name=location]").val(args.location);
		$("#installBox input[name=database]").val(args.database);
		$("#installBox input[name=username]").val(args.username);
		$("#installBox input[name=password]").val(args.password);
		$("#installBox input[name=admin_login]").val(args.admin_login);
		$("#installBox input[name=admin_password]").val(args.admin_password);
		$("#installBox input[name=retype_password]").val(args.admin_password);
		// submit form
		if (args.location && args.database && args.username && args.password
			&& args.admin_login && args.admin_password)
				$("#installBox input[type=button]").click();
	}

});

