/**
* 전역변수
**/
var $content, $roomList;
var $_GET;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	$content = $('#content');
	$roomList = $('#roomList');

	//정보 받아오기
	showLoadingPopup();
	getMyRoomInfo();

	document.addEventListener('tizenhwkey', function(e) {
		if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
		}
	});

	document.addEventListener("rotarydetent", function(event){
		location.href='./myRoomList.html';
	}, false);
});



/**
* 함수선언
**/
function getMyRoomInfo () {
//필요한 것만
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/rooms?cleaner_id='+HIMS['loginInfo']['id'],
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			var html = '';
			var roomCnt = 0;
			for (var i=0;i<data['result'].length;i++) {
				html += "<div class='e "+data['result'][i]['state'].toLowerCase()+"'></div>";
				roomCnt++;
			}

			$roomList.html(html);
			$content.children('.title').html(roomCnt+'Rooms');
			hideLoadingPopup();
		}
	});
}