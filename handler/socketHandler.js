var time = require('time');
module.exports = function (io, database) {
	io.sockets.on('connection', function (client) {
		console.log('[socket]connect:'+client.id);
		client.on('reset', function(){
			client.handshake.session.startEvtTime = time.time()
			client.handshake.session.save()
			client.emit('strTime', client.handshake.session.startEvtTime);
			console.log('[socket]Reset:'+client.handshake.session.startEvtTime)
		});
		client.on('getPressureTime', function(){
			database.getGroupedDataInHours(function(res){
				client.emit('pressureTimeData', res);	
			})
			
			console.log('[socket]SendPressureTimeData')
		});
		client.on('fulltime', function(){
			database.getEvtFromBeginning(function(res){
				var totalCount = [0,0,0,0,0,0,0,0,0]
				for (var i = 0; i < res.length; i++) {
					if(res[i]._id>=1&&res[i]._id<=9){
						totalCount[res[i]._id-1] = res[i].sum
					}
				}
				client.emit('CurCount', totalCount);
				console.log("[socket]totalCount:"+totalCount)
			})
			database.getFirstEvt(function(res){
				client.handshake.session.startEvtTime = res.time
				client.handshake.session.save()
				console.log('[socket]Fulltime:'+client.handshake.session.startEvtTime)
				client.emit('strTime', client.handshake.session.startEvtTime);
			})

		})			
		if(!client.handshake.session.startEvtTime){
			client.handshake.session.startEvtTime = time.time()
			client.handshake.session.save()
			console.log('[socket]startTime:'+client.handshake.session.startEvtTime)
		}else{

			database.getEvtFromTime(client.handshake.session.startEvtTime, function(res){
				var totalCount = [0,0,0,0,0,0,0,0,0]
				for (var i = 0; i < res.length; i++) {
					if(res[i]._id>=1&&res[i]._id<=9){
						totalCount[res[i]._id-1] = res[i].sum
					}
				}
				client.emit('CurCount', totalCount);
				console.log("[socket]totalCount:"+totalCount)
			})
		}
		client.emit('strTime', client.handshake.session.startEvtTime);
		
	});


	return {
		'hitEvent':function(channel){
			io.sockets.emit('hit', channel)
		},
		'pressureEvent':function(value){
			io.sockets.emit('pressure', value)
		},
		'tempEvent':function(value){
			io.sockets.emit('temperature', value)
		}
	}
}
