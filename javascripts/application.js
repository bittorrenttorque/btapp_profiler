jQuery(function() {
	function now() { return (new Date()).getTime(); }


	// Set up graphs 
	var delays = new SmoothieChart({ millisPerPixel: 40, grid: { strokeStyle: '#222', lineWidth: 1, millisPerLine: 5000, verticalSections: 1 }});
	var data = new SmoothieChart({ millisPerPixel: 40, grid: { strokeStyle: '#222', lineWidth: 1, millisPerLine: 5000, verticalSections: 1 }});
	var torrents = new SmoothieChart({ millisPerPixel: 40, grid: { strokeStyle: '#222', lineWidth: 1, millisPerLine: 5000, verticalSections: 1 }});
	var files = new SmoothieChart({ millisPerPixel: 40, grid: { strokeStyle: '#222', lineWidth: 1, millisPerLine: 5000, verticalSections: 1 }});
	var filesper = new SmoothieChart({ millisPerPixel: 40, grid: { strokeStyle: '#222', lineWidth: 1, millisPerLine: 5000, verticalSections: 1 }});
	// Attach to DOM
	delays.streamTo(document.getElementById("delays"));
	data.streamTo(document.getElementById("data"));
	torrents.streamTo(document.getElementById("torrents"));
	files.streamTo(document.getElementById("files"));
	filesper.streamTo(document.getElementById("filesper"));
	// Data
	var delaysSeries = new TimeSeries();
	var dataSeries = new TimeSeries();
	var filesSeries = new TimeSeries();
	var torrentsSeries = new TimeSeries();
	var filesperSeries = new TimeSeries();
	// Add to SmoothieChart
	delays.addTimeSeries(delaysSeries, { strokeStyle: 'rgba(255, 150, 0, 1)', fillStyle: 'rgba(255, 150, 0, 0.1)', lineWidth: 1 });
	data.addTimeSeries(dataSeries, { strokeStyle: 'rgba(255, 200, 50, 1)', fillStyle: 'rgba(255, 200, 50, 0.1)', lineWidth: 1 });
	files.addTimeSeries(filesSeries, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.1)', lineWidth: 1 });
	torrents.addTimeSeries(torrentsSeries, { strokeStyle: 'rgba(50, 250, 0, 1)', fillStyle: 'rgba(50, 250, 0, 0.1)', lineWidth: 1 });
	filesper.addTimeSeries(filesperSeries, { strokeStyle: 'rgba(100, 200, 200, 1)', fillStyle: 'rgba(100, 200, 200, 0.1)', lineWidth: 1 });

	// Start the communication with the client
	window.btapp = new Btapp();
	btapp.connect();

	// Keep track of the number of torrents we've seen
	var num_torrents = 0;
	btapp.live('torrent *', function(t) {
		++num_torrents;
		filesperSeries.append(now(), t.get('file').length);
		filesperSeries.append(now() + 1, 0);
	});
	btapp.on('client:error', function() { num_torrents = 0; });

	// Keep track of the number of files in all torrents we've seen
	var num_files = 0;
	btapp.live('torrent * file *', function() {
		++num_files;
	});
	btapp.on('client:error', function() { num_files = 0; });

	// Use the sync event for sync data size, and also take the
	// opportunity to display the torrent/file counts
	btapp.on('sync', function(data) {
		dataSeries.append(now(), JSON.stringify(data).length);
		_.defer(function() {
			dataSeries.append(now(), 0);
			torrentsSeries.append(now(), num_torrents);
			filesSeries.append(now(), num_files);
		});
	});

	// Set an interval and track how late the callback is
	// Given that we're concerned about blocking the gui
	// when processing btapp info, this will be a decent measure
	var then = now();
	var INTERVAL = 100;
	setInterval(function() {
		var dt = now() - then;
		then += dt;
		delaysSeries.append(now(), dt - INTERVAL);
	}, INTERVAL);

	// Support pausing/restarting the graphs
	$('#delays, #data, #files, #torrents').show().click(function() {
		delays.timer ? delays.stop() : delays.start();
		data.timer ? data.stop() : data.start();
		files.timer ? files.stop() : files.start();
		torrents.timer ? torrents.stop() : torrents.start();
		filesper.timer ? filesper.stop() : filesper.start();
	});
});