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
    LT.element("div", {}, document.body, "STARTING TESTS ...");
    TEST.request();
  },

  // TEST.request() sends the ajax request for the current test.
  // Do not use this method in your own functions and methods.
  request: function () {
    var test = TEST.tests[TEST.index];
    if (test.uploader) {
      LT.element("div", {}, document.body, 
        "... SORRY, UPLOADER NOT IMPLEMENTED YET ...");
      TEST.finish(null);
    }
    else {
      LT.ajaxRequest("POST", "../" + test.action, test.args, TEST.finish);
    }
  },

  // TEST.blank(ajax) returns "PASS" if the returned XMLHttpRequest object
  // (the ajax parameter) contains nothing but whitespace.
  blank: function (ajax) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    if (text == "") {
      return "PASS";
    }
    return "FAIL [" + text + "]";
  },

  // TEST.exists(ajax) returns "PASS" if the returned XMLHttpRequest object
  // (the ajax parameter) has the status 200 OK instead of 404 Not Found
  // or some other status.
  exists: function (ajax) {
    if (ajax.status == 200) {
      return "PASS";
    }
    return "FAIL [status = " + ajax.status + "]";
  },

  // TEST.unimplemented(ajax) returns "FAIL (test not implemented)" followed
  // by the text of the returned XMLHttpRequest object (the ajax parameter.)
  unimplemented: function (ajax) {
    var text = ajax ? ajax.responseText : "no XMLHttpRequest";
    return "FAIL (test not implemented) [" + text + "]";
  },

  // TEST.count(ajax, tag, target) returns "PASS" if the returned
  // XMLHttpRequest object (the ajax parameter) is an XML document containing
  // the specified number (target) of the specified type (tag) of elements.
  count: function (ajax, tag, target) {
    if (!ajax.responseXML) {
      return "FAIL [" + ajax.responseText + "]";
    }
    var count = ajax.responseXML.getElementsByTagName(tag).length;
    if (count == target) {
      return "PASS";
    }
    return "FAIL [returned " + count + " " + tag + "s]";
  },

  // TEST.equals(ajax, target) returns "PASS" if the returned XMLHttpRequest
  // object (the ajax parameter) contains the specified text (target) after
  // stripping leading and trailing whitespace.
  equals: function (ajax, target) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    return (text == target) ? "PASS" : "FAIL [" + text + "]";
  },

  // TEST.finish(ajax) is called when each ajax request is completed.
  // You should not use this method from your own functions and methods.
  finish: function (ajax) {
    var old_test = TEST.tests[TEST.index];
    var result = old_test.result(ajax);
    LT.element("div", {class: result.slice(0,4)}, document.body,
      old_test.action + ": " + result);
    if (old_test.abort && result != "PASS") {
      LT.element("div", {}, document.body, "... STOPPING TESTS!");
      return;
    }
    TEST.index++;
    if (TEST.index == TEST.tests.length) {
      LT.element("div", {}, document.body, "... FINISHED!");
      return;
    }
    var new_test = TEST.tests[TEST.index];
    if (new_test.group) {
      LT.element("div", {}, document.body, new_test.group);
    }
    TEST.request();
  }
};

