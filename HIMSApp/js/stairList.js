/**
* 전역변수
**/
var $stairList;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$stairList = $('#stairList');

	//yhList구동
	getStairList();


	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			$stairList.moveNext();
		} else {
			$stairList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/
function getStairList () {
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/floors',
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			var html = '';
			for (var i=0;i<data['result'].length;i++) {
				html += "<div class='row' onclick=\"location.href='./stairOverview.html?stairNum="+data['result'][i]+"';\">"+data['result'][i]+"F</div>";
			}
			$stairList.html(html);
			$stairList.yhList({
				title:'Floor'
			});

			hideLoadingPopup();
		}
	});
}