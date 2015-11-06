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
	//필요한 것만
	$.ajax({
		type:'GET',
		url:HIMS['apiUrl']+'/api/users',
		dataType:'json',
		headers:{
			"Content-Type":"application/json"
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
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
		},
		error:function(xhr, status, error) {
			console.log(status);
			console.log(xhr.responseText);
		}
	});
}