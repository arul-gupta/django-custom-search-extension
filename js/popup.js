sendData = function() {
	var requestData = {
		action: "filterUsers",
		data: $("#inputData").val()
	};
	localStorage.lastInput = requestData.data;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, requestData, function(response) {
	    console.log(response);
	    if(response && response.django === true) {
	    	console.log("Request under process");
	    	hideWarning();
	    } else {
	    	console.log("Doesn't look like a django listing page");
	    	showWarning();
	    }
	  });
	});
}

showWarning = function() {
	$("p.error").css("visibility", "visible");
}
hideWarning = function() {
	$("p.error").css("visibility", "hidden");
}

$( document ).ready(function() {
	$("#submit").click(function(){
		sendData();
	});
	if(localStorage.lastInput) {
		$("#inputData").val(localStorage.lastInput);
	}
});