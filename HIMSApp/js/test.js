/**
* 전역변수
**/
var pushService;
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching


	//초기구동함수
	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {

		} else {

		}
	}, false);
});

/**
* 함수선언
**/
function test (src) {
	var a = new Audio();
	a.src = src;
	a.play();
}