const { requestNewMessages } = require('./requestNewMessages.js');
const { STATE_APP: stateApp } = require('../state/stateApp.js');
const { createStreams } = require('./creatingStreams.js');

const processingRequest = async () => {
	if(!stateApp.streams) {
		stateApp.streams = await createStreams(stateApp.initial_store)
	}
	stateApp.streams.requests$.next('update')

	const response = await requestNewMessages();
	return response;
}

module.exports = {
	processingRequest
}