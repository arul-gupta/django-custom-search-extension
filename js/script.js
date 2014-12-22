var modalHTML = '<div id="processing-modal" class="modal fade processing-modal" tabindex="-1" role="dialog" aria-labelledby="confirmation-modal" aria-hidden="true" data-backdrop="static" data-keyboard=false><span class="processing-status">Processing...</span>';
var tableBody = "";
var users = [];
var requestLength = 0;
var isDjangoSite = false;

toggleAllHandler = function(event) {
	var checkAll = $("#result_list thead input[type='checkbox']");
	var nextState = $(checkAll).is(":checked");

	if(nextState) {
		$("#result_list tbody input[type='checkbox']").prop('checked', true);
	} else {
		$("#result_list tbody input[type='checkbox']").prop('checked', false);
	}
	updateCounter();
}

updateCounter = function() {
	var counter = $('.action-counter');
	var selected = $("#result_list tbody input[type='checkbox']:checked").length;
	var total = $("#result_list tbody input[type='checkbox']").length;
	counter.html(selected + " of " + total + " selected");
}

start = function() {
	$("#processing-modal").show();
	var checkAll = $("#result_list thead input[type='checkbox']");
	$("p.paginator").remove();
	$("span.question, span.clear, span.all").remove();
	$('.action-counter').html("");
	checkAll.on("click", toggleAllHandler);
}

processRequest = function(request, sendResponse) {
	tableBody =  $("#result_list tbody");
	if(request.action === "filterUsers") {
		if(isDjangoSite) {
			start();
			sendResponse({django: true});
			users = request.data.split(",");
			requestLength = users.length;
			tableBody.empty();
			getUserRow(users.pop());
		} else {
			sendResponse({django: false});
		}

	} else {
		console.log("Invalid action");
		finish();
	}
}


getUserRow  = function(paramData) {
	updateStatus(users.length, requestLength);
    $.ajax({
        url:'',
        type:"GET",
        data: {"q" : paramData},
        contentType:"application/json; charset=utf-8",
        success: function(responseData, textStatus, jqXHR){
        	// console.log(responseData);
        	var domParser =new DOMParser();
        	var doc = domParser.parseFromString(responseData, "text/html");
        	var row = $("#result_list tbody tr", doc);
        	console.log(paramData + ": " + row.length);
        	if(row.length > 0) {
        		tableBody.append(row);
        	}
        	if(users.length > 0) {
        		getUserRow(users.pop());
        	} else {
        		finish();
        	}
        },
        fail: function(xhr, status, error) {
            console.log(xhr);
            console.log("Error in getting user details for " + paramData);
            if(users.length > 0) {
        		getUserRow(users.pop());
        	} else {
        		finish();
        	}
        }
    });
}

updateStatus = function(remaining, requestLength) {
	var ele = $('.processing-status');
	ele.html(remaining + " of " + requestLength+ " Remaining");
}

finish = function() {
	$("#result_list tbody input[type='checkbox']").on("click", updateCounter);
	$("#processing-modal").hide();
}

checkIsDjangoSite = function() {
	var test1 = $("#site-name").text().trim().match(/django admin/i);
	var test2 = $("form#changelist-search input#searchbar").length > 0;
	var test3 = $("table#result_list").length > 0;

	isDjangoSite = test1 && test2 && test3;
	return isDjangoSite;
}


$( document ).ready(function() {
	if(checkIsDjangoSite()) {
		$('body').prepend(modalHTML);
	}
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	    console.log(request);
	    processRequest(request, sendResponse);
	});
});