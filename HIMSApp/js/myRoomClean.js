/**
* 전역변수
**/
var $content, $roomInfo;
var curLang = 'english';
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$content = $('#content');
	$roomInfo = $('#roomInfo');

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
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/rooms',
		success:function(data) {
			console.log(data);
			var html = '';
			var findFlag = false;
			for (var i=0;i<data['result'].length;i++) {
				//해당 층의 방 정보만 표시하기
				if (String(data['result'][i]['room_number']) == $_GET['roomNum']) {
					var statusText, checkIn='-----, --:--', checkOut='-----, --:--';

					if (data['result'][i]['state'].toLowerCase() == 'vc' || data['result'][i]['state'].toLowerCase() == 'oc') statusText = 'Cleaned';
					else statusText = 'Not cleaned';

					if (data['result'][i]['checkin_time'] != null) checkIn = data['result'][i]['checkin_time'].substr(5,5)+', '+data['result'][i]['checkin_time'].substr(11,5);
					if (data['result'][i]['checkout_time'] != null) checkOut = data['result'][i]['checkout_time'].substr(5,5)+', '+data['result'][i]['checkout_time'].substr(11,5);

					$roomInfo.addClass(data['result'][i]['state'].toLowerCase());
					$roomInfo.find('.roomNum').html(data['result'][i]['room_number']);
					$roomInfo.find('.statusText').html(statusText);
					$roomInfo.find('.checkIn > .desc').html(checkIn);
					$roomInfo.find('.checkOut > .desc').html(checkOut);

					if (data['result'][i]['requirement'] != null) {
						$roomInfo.find('.requirement').attr('english',data['result'][i]['requirement']['origin']).attr('spanish',data['result'][i]['requirement']['spanish']).html(escapeHtml(data['result'][i]['requirement']['origin']));
					}

					findFlag = true;
					break;
				}
			}

			if (findFlag == false) {
				alert('Number Does not Exist!');
				history.back();
				return;
			}

			$roomInfo.yhDialog({
				type:'confirm',
				btnAText:'VC',
				btnBText:'OC',
				onclickA:function () {
					doClean('VC');
				},
				onclickB:function () {
					doClean('OC');
				}
			});

			hideLoadingPopup();

			
		}
	});
}

function changeTranslation() {
	if (curLang == 'english') {
		var tmp = $roomInfo.find('.requirement').attr('spanish');
		$roomInfo.find('.requirement').html(escapeHtml(tmp));
		$roomInfo.find('.translate > .text').html('English');
		curLang = 'spanish';
	} else if (curLang == 'spanish') {
		var tmp = $roomInfo.find('.requirement').attr('english');
		$roomInfo.find('.requirement').html(escapeHtml(tmp));
		$roomInfo.find('.translate > .text').html('Spanish');
		curLang = 'english';
	}
}

function doClean(roomState) {
	if (!confirm("\n\n\n\n\nAre you sure you\nfinish cleaning?")) return;

	var postData = {};
	postData.room_num = $_GET['roomNum'];
	postData.state = roomState;

	HIMSApiCall({
		type:'POST',
		url:HIMS['apiUrl']+'/api/clean',
		data:JSON.stringify(postData),
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				return;
			}

			//location.href='./lo.html';
			history.back();
		}
	});
}