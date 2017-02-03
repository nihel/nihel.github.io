$(document).ready(function(){
    $("#content").load("home.html");

    $("a").hover(function() {
    var page = $(this).attr("href");
    $("#content").load(page);
    return false;
    });
});