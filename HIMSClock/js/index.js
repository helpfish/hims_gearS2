/**
* 전역변수
**/
var $managerPage, $cleanerPage, $loggedOutPage;
var loginInfo = {}, watchFaceType = '';
var $needleSec, $needleMin, $needleHour, $floorSelect, $batteryLevel, $clockWrap;
var timeout = 0;

/**
* 초기구동
**/
$(function () {
	//jQuery Element Caching
	$managerPage = $('#managerPage');
	$cleanerPage = $('#cleanerPage');
	$loggedOutPage = $('#loggedOutPage');


	//현재 로그인 정보를 받아오고 맞는 화면을 표시함
	tizen.filesystem.resolve("wgt-private", function(dir) {
		dir.listFiles(function (fileList) {
			var tokenFile = null;
			for (var i=0;i<fileList.length;i++) {
				if (fileList[i].name == 'HIMSLoginToken') {
					tokenFile = fileList[i];
				}
			}

			if (tokenFile == null) {
				setWatchFace();
				return;
			}


			tokenFile.openStream("r",function (fp) {
				var tmp = fp.read(tokenFile.fileSize);
				var tmp2 = tmp.split("\n");
				loginInfo['token'] = tmp2[0];
				loginInfo['name'] = tmp2[1];
				loginInfo['team'] = tmp2[2];
				loginInfo['position'] = tmp2[3];
				loginInfo['id'] = tmp2[4];
				setWatchFace();

				fp.close();
			}, null, "UTF-8");
		});
	});

	//setWatchFace();

	//다시 화면을 띄웠을 때 현재시간을 바로 표시하도록 함
	document.addEventListener('visibilitychange', function(e) {
        showClock();
		getBatteryLevel();
		//hideLoadingPopup();
    });
});



/**
* 함수선언
**/
function showClock () {
	if (timeout) clearTimeout(timeout);

	var d = new Date();
	//var d = tizen.time.getCurrentDateTime();
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
	var ms = d.getMilliseconds();

	if (loginInfo['position'] == 'manager') {
		//alert('현재시각 : '+hour+':'+min+':'+sec+'.'+ms);
		var secDeg = sec*6;
		var minDeg = min*6+sec*0.1;
		var hourDeg = hour*30+min*0.5;

		$needleSec.css({
			'-webkit-transform':'rotate('+secDeg+'deg)'
		});
		$needleMin.css({
			'-webkit-transform':'rotate('+minDeg+'deg)'
		});
		$needleHour.css({
			'-webkit-transform':'rotate('+hourDeg+'deg)'
		});
	} else if (loginInfo['position'] == 'cleaner') {
		$clockWrap.html(zerofill(hour%12,2)+':'+zerofill(min,2)+(hour%12==0?'am':'pm'));
	} else {
		$clockWrap.find('.hour').html(zerofill(hour,2));
		$clockWrap.find('.minute').html(zerofill(min,2));
	}

	//배터리 레벨도 갱신
	getBatteryLevel();

	timeout = setTimeout(function () {
		showClock();
	},1000-ms);
}

//HIMSApp의 loginName.html, loginPw.html에 로그인 요청을 보내고 성공할 경우 token을 받아 저장함
/*토큰의 형식 : 
	token
	name
	team
	position
*/
function doLogin() {
	var appCtrl = new tizen.ApplicationControl("HIMS_loginName", null, null, null, null);
	var appCtrlReply = {
		onsuccess:function (reply) {
			var inputData = reply[0].value[0]+"\n"+reply[0].value[1]+"\n"+reply[0].value[2]+"\n"+reply[0].value[3]+"\n"+reply[0].value[4];
			writeToken(inputData);

			loginInfo['token'] = reply[0].value[0];
			loginInfo['name'] = reply[0].value[1];
			loginInfo['team'] = reply[0].value[2];
			loginInfo['position'] = reply[0].value[3];
			loginInfo['id'] = reply[0].value[4];

			setWatchFace();
		}
	};
	tizen.application.launchAppControl(appCtrl, null, null, null, appCtrlReply);
}

function doLogout() {
	if (!confirm("\n\n\n\n\nAre you\nsure you \nwant to\nlogout?")) return;
	writeToken ('');
	loginInfo = {};
	setWatchFace();
	
}

function writeToken (inputData) {
	tizen.filesystem.resolve("wgt-private", function(dir) {
		
		dir.listFiles(function (fileList) {
			var fileExists = 0;
			var tokenFile;
			for (var i=0;i<fileList.length;i++) {
				if (fileList[i].name == 'HIMSLoginToken') {
					tokenFile = fileList[i];
					fileExists = 1;
				}
			}

			if (fileExists == 0) {
				tokenFile = dir.createFile('HIMSLoginToken');
			}

			tokenFile.openStream("w",function (fp) {
				fp.write(inputData);
				fp.close();
			}, null, "UTF-8");
		});
	});
}

function readToken() {
	tizen.filesystem.resolve("wgt-private", function(dir) {
		dir.listFiles(function (fileList) {
			var tokenFile = null;
			for (var i=0;i<fileList.length;i++) {
				if (fileList[i].name == 'HIMSLoginToken') {
					tokenFile = fileList[i];
				}
			}

			if (tokenFile == null) {
				//alert("File Not Exists!");
				return;
			}


			tokenFile.openStream("r",function (fp) {
				alert(fp.read(tokenFile.fileSize));
				fp.close();
			}, function (e) {
				alert('Error : '+e.message);	
			}, "UTF-8");
		});
	});
}

function getBatteryLevel() {
	try {
		$batteryLevel.html(Math.round(navigator.webkitBattery.level*100)+'%');
	} catch (e) {

	}
}

function setWatchFace () {
	if (loginInfo['position'] == 'manager') {
		$('.page').removeClass('show');
		$managerPage.addClass('show');

		$needleSec = $managerPage.children('.needleSec');
		$needleMin = $managerPage.children('.needleMin');
		$needleHour = $managerPage.children('.needleHour');
		$batteryLevel = $managerPage.children('.batteryLevel');
	} else if (loginInfo['position'] == 'cleaner') {
		$clockWrap = $cleanerPage.children('.clockWrap');
		$batteryLevel = $cleanerPage.children('.batteryLevel');

		$('.page').removeClass('show');
		$cleanerPage.addClass('show');
	} else {
		$clockWrap = $loggedOutPage.children('.clockWrap');

		$('.page').removeClass('show');
		$loggedOutPage.addClass('show');
	}

	showClock();
	getBatteryLevel();
}

function callHIMSApp(operation) {
	showLoadingPopup();
	setTimeout(function () {
		hideLoadingPopup();
	},2000);
	var appCtrl = new tizen.ApplicationControl(operation, null, null, null, [new tizen.ApplicationControlData("HIMSLoginInfo", [loginInfo['token'],loginInfo['name'],loginInfo['team'],loginInfo['position'],loginInfo['id']])]);
	tizen.application.launchAppControl(appCtrl, null, null, null, null);
}