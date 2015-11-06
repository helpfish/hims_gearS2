/**
* 전역변수
**/
var $test;

/**
* 초기구동
**/
$(function () {
	//jQuery Element Caching
	$test = $('#test');

	//yhDialog구동
	$test.yhDialog({
		type:'alert',
		verticalAlign:'middle',
		onclickA:function () {
			tizen.application.getCurrentApplication().exit();
			//location.href='channel.html';
		}
	});


	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			//$stairList.moveNext();
		} else {
			//$stairList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/