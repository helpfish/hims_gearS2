/**
* 전역변수
**/
var audioCtrl;
var mAudio;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching

	mAudio = new Audio();

	//초기구동함수
	recorderInit();

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
function recorderInit() {
	navigator.webkitGetUserMedia({video:false,audio:true},function (e) {
		/*alert(e);
		var str = '';
		for(var x in e) {
			str += x+" : "+e[x]+"\n";
		}
		alert(str);*/
		navigator.tizCamera.createCameraControl(e,function (ctrl) {
			audioCtrl = ctrl;

			$('#log').html('ready!');
		},function () {
			/*alert(e);
			var str = '';
			for(var x in e) {
				str += x+" : "+e[x]+"\n";
			}
			alert(str);*/
		});
	},function () {
		$('#log').html('Permission Denied!');
	});
}

function recordStart() {
		var d = new Date();
		var fileName = d.getFullYear()+zerofill(d.getMonth()+1,2)+zerofill(d.getDate(),2)+zerofill(d.getHours(),2)+zerofill(d.getMinutes(),2)+zerofill(d.getSeconds(),2);
		
		var audioSetting = {
			maxFileSizeBytes:1024*1024*30,
			fileName:fileName,
			recordingFormat:'amr'
		};
		audioCtrl.recorder.applySettings(audioSetting,function () {
			audioCtrl.recorder.start(function () {
				$('#log').html('Recording...');
			}, function (e) {
				var str = '';
				for(var x in e) {
					str += x+" : "+e[x]+"\n";
				}
				alert(str);
			});
		}, function () {
			$('#log').html('setting fail');
		});
}

function recordStop() {
	audioCtrl.recorder.stop(function () {
		$('#log').html('');
	}, function () {
		
	});
}

function test() {
	//파일명은 20151104220232
	var filePath = "file:///opt/usr/media/Sounds";
	tizen.filesystem.resolve(filePath, function(dir) {
		dir.listFiles(function (fileList) {
			var targetFile = null;
			for (var i=0;i<fileList.length;i++) {
				if (fileList[i].name == '20151104220232') {
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(){
						if (this.readyState == 4){
							var fr = new FileReader();
							fr.onload = function (e) {
								//console.log(e);
								//alert(e);
								alert(e.target.result.substr(0,50));
								//mAudio.src = e.target.result;
								//mAudio.play();
								return;
							}
							fr.readAsDataURL(this.response);
							//var data = URL.createObjectURL(this.response);
							//alert(data.substr(0,50));
						}
					}
					xhr.open('GET', fileList[i].toURI());
					xhr.responseType = 'blob';
					xhr.send();


					/*alert(fileList[i].toURI());
					targetFile = fileList[i];
					//alert(fileList[i].name);
					//mAudio.src = fileList[i].toURI();
					//alert(fileList[i].toURI());
					//mAudio.play();

					var fr = new FileReader();
					fr.onload = function (e) {
						//console.log(e);
						alert(e);
						//alert(e.target.result.substr(0,50));
						//mAudio.src = e.target.result;
						//mAudio.play();
						return;
					}
					fr.readAsDataURL(fileList[i].toURI());*/


					break;
				}
			}

			/*if (targetFile == null) {
				alert('File Does not Exist!');
				return;
			}




			targetFile.openStream("r",function (fp) {
				var tmp = fp.read(targetFile.fileSize);
				fp.close();

			}, null, "UTF-8");*/
		});
	},function () {
		
	});
}