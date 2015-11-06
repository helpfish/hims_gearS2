/**
* 페이지들에서 공통으로 쓰이는 함수 선언
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