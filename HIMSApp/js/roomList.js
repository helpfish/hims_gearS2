/**
* 전역변수
**/
var $roomList;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$roomList = $('#roomList');

	getRoomList();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			history.back();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			$roomList.moveNext();
		} else {
			$roomList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/
function getRoomList() {
//필요한 것만
	$.ajax({
		type:'GET',
		url:HIMS['apiUrl']+'/api/rooms',
		dataType:'json',
		headers:{
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
			var html = '';
			for (var i=0;i<data['result'].length;i++) {
				//해당 층의 방 정보만 표시하기
				if (String(data['result'][i]['room_number']).substr(0,1) == $_GET['stairNum']) {
					html += "<div class='row "+data['result'][i]['state'].toLowerCase()+"'>\
						<div class='statusDot'><div class='inner'></div></div>\
						<div class='desc'>\
							<div class='roomNum'>"+data['result'][i]['room_number']+"</div>\
							<div class='statusText'></div>\
						</div>\
					</div>";
				}
			}

			$roomList.html(html);
			$roomList.yhList({
				onclick:function (idx) {
					location.href='./roomDetail.html?roomNum='+encodeURIComponent($roomList.children('.row:eq('+idx+')').find('.roomNum').html());
				}
			});

			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
		}
	});
}