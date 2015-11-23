/**
* 페이지 공통 변수
**/
var HIMS = {}, $_GET = {};
HIMS['apiUrl'] = 'http://54.183.200.158';

/**
* 페이지 공통 초기 구동
**/
function HIMS_init() {
	//GET변수 저장
	$_GET = parseQS();

	//로그인이 필요한 페이지에 App request 저장
	try {
		var reqAppCtrl = tizen.application.getCurrentApplication().getRequestedAppControl();
		HIMS['loginInfo'] = {};
		HIMS['loginInfo']['token'] = reqAppCtrl.appControl.data[0].value[0];
		HIMS['loginInfo']['name'] = reqAppCtrl.appControl.data[0].value[1];
		HIMS['loginInfo']['team'] = reqAppCtrl.appControl.data[0].value[2];
		HIMS['loginInfo']['position'] = reqAppCtrl.appControl.data[0].value[3];
		HIMS['loginInfo']['id'] = reqAppCtrl.appControl.data[0].value[4];

	} catch (e) {
		HIMS['loginInfo'] = {};
		HIMS['loginInfo']['token'] = 1;
		HIMS['loginInfo']['name'] = 'admin';
		HIMS['loginInfo']['team'] = 'test';
		HIMS['loginInfo']['position'] = 'manager';
		HIMS['loginInfo']['id'] = 'admin';
	}
}

/**
* 페이지 공통 함수
**/
//줄바꿈을 br태그로 변환
function nl2br(str){ 
  return str.replace(/\n/g, "<br />"); 
}

//number_format의 JS버전
function number_format(num) {
	if (typeof(num) == 'number') num = String(num);
	var result = '';
	for (var i=0;i<num.length;i++) {
		result += num.charAt(i);
		if ((num.length-i-1)%3 == 0 && (num.length-i-1) != 0) result+=',';
	}
	return result;
}

//addslahes의 javascript버전
function addslashes (str) { 
	return str.replace(/'/g, "\\'");
}

//htmlentities의 javascript버전
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

//Y-m-d H:i:s형식의 시간을 Date Object로 변환
function strToDate(dateString) {
	var tmp = dateString.split(/[- :]/);
	return new Date(tmp[0], tmp[1]-1, tmp[2], tmp[3], tmp[4], tmp[5]);
}

//zerofill
function zerofill(num,len) {
	var i,out='';
	if (typeof(num) == 'number') num = num.toString();
	if (num.length >= len) return num;
	if (num.length < len) {
		for(i=0;i<len-num.length;i++) out+='0';
		return out+num;
	}
}

//Query String을 파싱하여 object로 만드는 함수
function parseQS() {
	var urlParams = {};
	var match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); }, query = window.location.search.substring(1);
	while (match = search.exec(query)) urlParams[decode(match[1])] = decode(match[2]);

	return urlParams;
}

//쿠키를 저장하는 함수
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

//쿠키를 받아오는 함수
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}

//zerofill
function zerofill(num,len) {
	var i,out='';
	if (typeof(num) == 'number') num = num.toString();
	if (num.length >= len) return num;
	if (num.length < len) {
		for(i=0;i<len-num.length;i++) out+='0';
		return out+num;
	}
}

//removeExt
function removeExt(str) {
	return str.replace(/\.[^/.]+$/, "");
}

//로딩창 띄우는 함수
function showLoadingPopup() {
	if (window.$loadingPopup != null) $loadingPopup.addClass('show');
	else {
		var html = "<div id='loadingPopup'>\
			<div class='icon'></div>\
			<div class='text'></div>\
		</div>";
		$('body').append(html);
		window.$loadingPopup = $('#loadingPopup').addClass('show');
	}
}

function hideLoadingPopup() {
	if (window.$loadingPopup != null) window.$loadingPopup.removeClass('show');
}

//base64 to blob
function base64ToBlob (base64) {
	// decode base64 string, remove space for IE compatibility
	var binary = atob(base64.replace(/\s/g, ''));

	// get binary length
	var len = binary.length;

	// create ArrayBuffer with binary length
	var buffer = new ArrayBuffer(len);

	// create 8-bit Array
	var view = new Uint8Array(buffer);

	// save unicode of binary data into 8-bit Array
	for (var i = 0; i < len; i++) {
		view[i] = binary.charCodeAt(i);
	}

	// create the blob object with content-type "application/pdf"               
	var blob = new Blob( [view], { type: "audio/mp3" });

	return blob;
}

function base64ToArrayBuffer(base64) {
    var binary_string =  atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

//ajax요청 통합
function HIMSApiCall(option) {
	try {
		var token = HIMS['loginInfo']['token'];
	} catch (e) {
		token = "";
	}

	option = $.extend({
		type:'GET',
		url:'',
		dataType:'json',
		timeout:10000,
		headers:{
			"Content-Type":"application/json",
			"Authorization":"Basic "+token
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			if (status == 'timeout') {
				alert('Connection timeout.');
			} else if (status == 'error') {
				if (error == 'NOT FOUND') {
					alert('Invalid API Call.');	
				} else {
					alert('Unable to connect to server.');
				}
			}

			if (history.length == 1) {
				tizen.application.getCurrentApplication().exit();
			} else {
				history.back();
				hideLoadingPopup();
			}
			//console.log(xhr);
			//console.log(status);
			//console.log(error);
			//alert(xhr.responseText);
			
		}
	}, option);

	$.ajax(option);
	
}