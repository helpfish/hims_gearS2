/**
* 전역변수
**/
var $pwWrap, $mbId, $mbPw;
var reqAppCtrl, $_GET;
/**
* 초기구동
**/
$(function () {
	//jQuery Element Caching
	$pwWrap = $('#pwWrap');
	$mbId = $('#mbId');
	$mbPw = $('#mbPw');

	$_GET = parseQS();
	$mbId.val($_GET['mbId']);

	//로그인 결과를 되돌려줄 AppCtrl정보
	reqAppCtrl = tizen.application.getCurrentApplication().getRequestedAppControl();

	//yhDialog 적용
	$pwWrap.yhDialog({
		type:'alert',
		btnAText:'Login',
		verticalAlign:'middle',
		onclickA:function () {
			doLogin();
		}
	});

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			history.back();
    	}
    });
});

/**
* 함수선언
**/
//입력한 아이디와 비밀번호로 로그인 요청 보내는 함수
function doLogin() {
	//console.log($('input').serialize());
	if (reqAppCtrl && reqAppCtrl.callerAppId) {
		/*try {
			reqAppCtrl.replyResult([new tizen.ApplicationControlData("HIMSLoginInfo", ['1','Young-ho Jin','Development','manager'])]);
		} catch (e) {

		}

		tizen.application.getCurrentApplication().exit();*/
	
		var loginData = {};
		loginData.id = $('input[name=id]').val();
		loginData.pw = $('input[name=pw]').val();

		$.ajax({
			type:'POST',
			url:HIMS['apiUrl']+'/api/users/login',
			data:JSON.stringify(loginData),
			dataType:'json',
			headers:{
				"Content-Type":"application/json"
			},
			beforeSend:function () {
				showLoadingPopup();
			},
			success:function(data) {
				try {
					reqAppCtrl.replyResult([new tizen.ApplicationControlData("HIMSLoginInfo", [data['result']['token'],data['result']['name'],data['result']['team'],data['result']['position'],$_GET['mbId']])]);
				} catch (e) {

				}

				tizen.application.getCurrentApplication().exit();

				//hideLoadingPopup();
			},
			error:function(xhr, status, error) {
				var data = JSON.parse(xhr.responseText);
				hideLoadingPopup();
				alert(data['message']);
			}
		});
	}
}