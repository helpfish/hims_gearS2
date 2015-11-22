/**
* 전역변수
**/
var pushService;
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching


	//초기구동함수
	pushInit();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {

		} else {

		}
	}, false);
});

/**
* 함수선언
**/
function pushInit() {
	pushService = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/push_test");
	//printObj(pushService);
	printObj(tizen);


	/*try {
		tizen.push.registerService(pushService, function (id) {
			alert(id);	
		}, function (e) {
			alert(e);	
		});
		alert('try!');
	} catch (e) {
		alert('fail!');
		alert(e);
	}*/
}

function printObj(obj) {
	var output = "\n\n\n\n";
	for(var x in obj) {
		output += x+" : "+[obj[x]]+"\n";
	}
	output += "\n\n\n\n";
	alert(output);
}