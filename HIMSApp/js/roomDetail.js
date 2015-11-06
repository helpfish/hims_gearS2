/**
* 전역변수
**/
var $content;
var isInspected = false;
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$content = $('#content');

	//해당 방의 정보를 받아옴
	getRoomDetail($_GET['roomNum']);

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") history.back();
    });
});



/**
* 함수선언
**/
function getRoomDetail (roomNum) {
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
			var findFlag = false;
			for (var i=0;i<data['result'].length;i++) {
				
				//해당 방 정보만 표시하기
				if (String(data['result'][i]['room_number']) == $_GET['roomNum']) {
					try {
						if (data['result'][i]['evaluation']['type'] != null) isInspected = true;
					} catch (e) {

					}

					console.log(data['result'][i]);
					var statusText, checkIn='-----, --:--', checkOut='-----, --:--';

					if (data['result'][i]['state'].toLowerCase() == 'vc' || data['result'][i]['state'].toLowerCase() == 'oc') statusText = 'Cleaned';
					else statusText = 'Not cleaned';

					if (data['result'][i]['checkin_time'] != null) checkIn = data['result'][i]['checkin_time'].substr(5,5)+', '+data['result'][i]['checkin_time'].substr(11,5);
					if (data['result'][i]['checkout_time'] != null) checkOut = data['result'][i]['checkout_time'].substr(5,5)+', '+data['result'][i]['checkout_time'].substr(11,5);

					$content.addClass(data['result'][i]['state'].toLowerCase());
					$content.find('.roomNum').html(data['result'][i]['room_number']);
					$content.find('.statusText').html(statusText);
					$content.find('.checkIn > .desc').html(checkIn);
					$content.find('.checkOut > .desc').html(checkOut);

					findFlag = true;
					break;
				}
			}

			if (findFlag == false) {
				alert('Number Does not Exist!');
				tizen.application.getCurrentApplication().exit();
				return;
			}

			getCleanerName();
			//hideLoadingPopup();

			
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
		}
	});
}

function getCleanerName () {
	$.ajax({
		type:'GET',
		url:HIMS['apiUrl']+'/api/users?room_num='+$_GET['roomNum'],
		dataType:'json',
		headers:{
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		success:function(data) {
			try {
				var cleanerName = data['result'][0]['name'].charAt(0).toUpperCase()+data['result'][0]['name'].slice(1).toLowerCase();
			} catch (e) {
				var cleanerName = 'No cleaner';
			}

			$content.find('.mbName').html(cleanerName);

			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
		}
	});
}

function doInspection() {
	if (isInspected) {
		alert('Already Inspected!');
		return;
	}
	var cleanerName = $content.find('.mbName').html();
	if (cleanerName == 'No cleaner') {
		alert('There is no cleaner!');
		return;
	}
	location.href='./formSelection.html?roomNum='+$_GET['roomNum']+'&cleanerName='+encodeURIComponent(cleanerName);
}

function doComment() {
	location.href='./comment.html?roomNum='+$_GET['roomNum'];
}