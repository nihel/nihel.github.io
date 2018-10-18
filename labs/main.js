$(document).ready(function(){

	$("#content").load("home.html");

	/**
	$("a").hover(function() {
		var page = $(this).attr("href");
		$("#content").load(page);
	return false;
	});
	**/


	$("a").on({
		mouseenter: function(){
			var page = $(this).attr("href");
			$("#content").load(page); return false;
		},
		mouseleave: function(){
			$("#content").empty();
		}
	});

});