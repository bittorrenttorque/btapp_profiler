jQuery(function() {
	function set(id, text) {
		$('#' + id).text(text);
	}
	function append(id, text) {
		$('#' + id).append('<div>' + text + '</div>');
	}

	window.btapp = new Btapp();
	btapp.connect();

	btapp.on('add', function(obj) {
		if(typeof obj !== 'object') return;
		append('events', obj.path[1] + ' ready');
	});

	var torrents = 0;
	btapp.live('torrent *', function() {
		set('torrents', ++torrents + ' torrents');
	});

	var files = 0;
	btapp.live('torrent * file *', function() {
		set('files', ++files + ' files');
	});
});