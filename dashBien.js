document.addEventListener("DOMContentLoaded", function () {
	init();
});
function init(){
	var video,
	player,
	mpd_url = "output/stream.mpd";
	video = document.querySelector("video");
	player = dashjs.MediaPlayer().create();
	player.initialize(video, mpd_url, true);
	player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function() {
		clearInterval(eventPoller);
	});
	
	var dps1 = []; // dataPoints
	var dps2 = [];
	var chart1 = new CanvasJS.Chart("chartContainer1", {
		title :{
			text: "Bit Rate [Mbps]"
		},
		axisY: {
			includeZero: false
		},      
		data: [{
			type: "line",
			dataPoints: dps1
		}]
	});
	var chart2 = new CanvasJS.Chart("chartContainer2", {
		title :{
			text: "Buffer Size [sec]"
		},
		axisY: {
			includeZero: false
		},      
		data: [{
			type: "line",
			dataPoints: dps2
		}]
	});
	
	var xVal = 0;
	var yVal = 0; 
	var dataLength = 20; // number of dataPoints visible at any point
	var updateChart1 = function (count,br) {
		count = count || 1;
		for (var j = 0; j < count; j++) {
			yVal = br;
			dps1.push({
				x: xVal,
				y: yVal
			});
			xVal++;
		}
		if (dps1.length > dataLength) {
			dps1.shift();
		}
		chart1.render();
	};
	
	var updateChart2 = function (count,bs) {
		count = count || 1;
		for (var j = 0; j < count; j++) {
			yVal = bs;
			dps2.push({
				x: xVal,
				y: yVal
			});
			xVal++;
		}
		if (dps2.length > dataLength) {
			dps2.shift();
		}
		chart2.render();
	};

var eventPoller = setInterval(function() {
	var streamInfo = player.getActiveStream().getStreamInfo();
	var dashMetrics = player.getDashMetrics();
	var dashAdapter = player.getDashAdapter();
	if (dashMetrics && streamInfo) {
		const periodIdx = streamInfo.index;
		var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
		var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
		var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx) / 1000) : NaN;
		document.getElementById('buffer').innerText = bufferLevel + " secs";
		document.getElementById('bitrate').innerText = bitrate + " Kbps";
		document.getElementById('representation').innerText = repSwitch.to;
		}
	updateChart1(dataLength,bitrate);
	updateChart2(dataLength,bufferLevel);
	}, 500);
}