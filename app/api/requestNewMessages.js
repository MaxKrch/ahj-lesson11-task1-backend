const { lastValueFrom } = require('rxjs')

const { STATE_APP: stateApp } = require('../state/stateApp.js');

const requestNewMessages = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			await updateStoreMessages();
			const messages = await getMessagesForSending();

			resolve(messages)
		} catch (err) {
			console.log(err);
			reject('Что-то пошло не так')
		}
	})
}

const updateStoreMessages = async() => {
	stateApp.streams.setStore('sending')
}

const getMessagesForSending = async () => {
	const messages = await stateApp.streams.getStore();

	return messages.sent;
}	

module.exports = {
	requestNewMessages
}