/**
* 전역변수
**/
var $loginNameList;

/**
* 초기구동
**/
$(function () {
	//jQuery Element Caching
	$loginNameList = $('#loginNameList');
	getNameList();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			$loginNameList.moveNext();
		} else {
			$loginNameList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/
function getNameList() {
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/users',
		dataType:'json',
		headers:{
			"Content-Type":"application/json"
		},
		success:function (data) {
			console.log(data);
			html = '';
			for (var i=0;i<data['result'].length;i++) {
				html += "<div class='row' mbId='"+escapeHtml(data['result'][i]['id'])+"'>"+escapeHtml(data['result'][i]['name'])+"</div>";
			}

			$loginNameList.html(html);

			//yhList구동
			$loginNameList.yhList({
				onclick:function (idx) {
					var mbId = $loginNameList.children('.row:eq('+idx+')').attr('mbId');
					location.href='./loginPw.html?mbId='+encodeURIComponent(mbId);
				}
			});

			hideLoadingPopup();
		}
	});
}