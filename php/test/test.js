// TEST is an object that carries out automated ajax tests.

var TEST = {

	// TEST.index keeps track of which test is being run.
	// You should not modify TEST.index.
	index: 0,

	// TEST.tests is an array of tests (empty by default.)
	// You should append or replace this with your own tests.
	tests: [],

	// TEST.start() starts the tests. It should not be called
	// until the document is loaded (i.e. "onload = TEST.start;".)
	start: function () {
		$("#output").empty();
		$("<div>").text("STARTING TESTS ...").appendTo($("#output"));
		TEST.index = 0;
		TEST.request();
	},

	// TEST.request() sends the ajax request for the current test.
	// Do not use this method in your own functions and methods.
	request: function () {
		var current_test = TEST.tests[TEST.index];
		if (current_test.group) {
			$("<div>").text(current_test.group).appendTo($("#output"));
			TEST.index++;
			current_test = TEST.tests[TEST.index];
		}
		if (current_test.uploader)
			current_test.uploader.submit(current_test.args);
		else $.ajax({
			type: "POST",
			url: current_test.action,
			data: current_test.args,
			complete: TEST.finish
		});
	},

	// TEST.blank(ajax) returns "PASS" if the returned XMLHttpRequest object
	// (the ajax parameter) contains nothing but whitespace.
	blank: function (ajax) {
		var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
		if (text == "") return "PASS";
		else return "FAIL [" + text + "]";
	},

	// TEST.exists(ajax) returns "PASS" if the returned XMLHttpRequest object
	// (the ajax parameter) has the status 200 OK instead of 404 Not Found
	// or some other status.
	exists: function (ajax) {
		if (ajax.status == 200) return "PASS";
		else return "FAIL [status = " + ajax.status + "]";
	},

	// TEST.unauthorized(ajax) returns "PASS"
	// if the response has a status of 401 (Unauthorized).
	unauthorized: function (ajax) {
		if (ajax.status == 401) return "PASS";
		else return "FAIL [status = " + ajax.status + "]";
	},

	// TEST.unimplemented(ajax) returns "FAIL (test not implemented)" followed
	// by the text of the returned XMLHttpRequest object (the ajax parameter.)
	unimplemented: function (ajax) {
		if (ajax.responseText)
			return "FAIL (test not implemented) [" + ajax.responseText + "]";
		else return "FAIL (test not implemented) [status = " + ajax.status + "]";
	},

	// TEST.uploaded(result) returns "PASS" if result is not a string.
	// Uploader tests do not have an XMLHttpRequest object.
	// Instead the server must return javascript which passes a result
	// to the TEST.finish method.
	uploaded: function (result) {
		if (typeof (result) == 'string') return "FAIL [" + result + "]";
		else return "PASS";
	},

	// TEST.count(ajax, target) returns "PASS" if the response
	// is a JSON array with the specified length (target.)
	count: function (ajax, target) {
		try {var data = JSON.parse(ajax.responseText);}
		catch (e) {return "FAIL [" + ajax.responseText + "]";}
		if (typeof(data.length) == "undefined")
			return "FAIL [data is " + typeof(data) + "]";
		else if (data.length == target) return "PASS";
		else return "FAIL [returned " + data.length + "objects]";
	},

	// TEST.one(ajax) and TEST.zero(ajax) are shorthand for
	// TEST.count(ajax, 1) and TEST.count(ajax, 0).
	// They can also be directly used as test.result callbacks
	// because they only require an ajax argument.
	one: function (ajax) {return TEST.count(ajax, 1);},
	zero: function (ajax) {return TEST.count(ajax, 0);},

	// TEST.string(ajax, target) returns "PASS" if the response
	// contains the specified text (target)
	// after stripping leading and trailing whitespace.
	string: function (ajax, target) {
		var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
		return (text == target) ? "PASS" : "FAIL [" + text + "]";
	},

	// TEST.logged_out(ajax) returns "PASS" if the response
	// is the string "You are not logged in."
	logged_out: function (ajax) {return TEST.string(ajax, "You are not logged in.");},

	// TEST.json(ajax, target) returns "PASS" if the response
	// is JSON equivalent to the specified javascript object (target.)
	json: function (ajax, target) {
		try {var data = JSON.parse(ajax.responseText);}
		catch (e) {return "FAIL [parse error: " + ajax.responseText + "]";}
		if (JSON.stringify(data) == JSON.stringify(target)) return "PASS";
		else return "FAIL [" + ajax.responseText + "]";
	},

	// TEST.finish(ajax) is called when each ajax request is completed.
	// You should not use this method from your own functions and methods.
	finish: function (ajax) {
		var old_test = TEST.tests[TEST.index];
		var result = old_test.result(ajax);
		$("<div>").text(old_test.action + ": " + result).appendTo($("#output"))
			.addClass(result.slice(0, 4));
		if (old_test.abort && result != "PASS") {
			$("<div>").text("... STOPPING TESTS!").appendTo($("#output"));
			return;
		}
		TEST.index++;
		if (TEST.index == TEST.tests.length) {
			$("<div>").text("... FINISHED!").appendTo($("#output"));
			return;
		}
		TEST.request();
	}
};

