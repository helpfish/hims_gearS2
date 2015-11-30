/**
* 전역변수
**/
var $content, $roomList, $statusWrap;
var $_GET;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	$content = $('#content');
	$roomList = $('#roomList');
	$statusWrap = $('#statusWrap');

	//층수 변경하고 정보 받아오기
	$content.children('.title').html($_GET['stairNum']+'F');
	showLoadingPopup();
	getStairInfo();

	document.addEventListener('tizenhwkey', function(e) {
		if(e.keyName == "back") {
			history.back();
		}
	});

	document.addEventListener("rotarydetent", function(event){
		location.href='./roomList.html?stairNum='+$_GET['stairNum'];
	}, false);
});



/**
* 함수선언
**/
function getStairInfo () {
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/rooms',
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			var html = '';
			var cleanCnt = 0, dirtyCnt = 0;
			for (var i=0;i<data['result'].length;i++) {
				//해당 층의 방 정보만 표시하기
				if (String(data['result'][i]['room_number']).substr(0,1) == $_GET['stairNum']) {
					html += "<div class='e "+data['result'][i]['state'].toLowerCase()+"'></div>";

					if (data['result'][i]['state'] == 'VC' || data['result'][i]['state'] == 'OC') {
						cleanCnt++;
					} else if (data['result'][i]['state'] == 'VD' || data['result'][i]['state'] == 'OD') {
						dirtyCnt++;
					}
				}
			}

			$roomList.html(html);
			$statusWrap.find('.notCleaned > .num').html(dirtyCnt);
			$statusWrap.find('.cleaned > .num').html(cleanCnt);
			hideLoadingPopup();
		}
	});
}