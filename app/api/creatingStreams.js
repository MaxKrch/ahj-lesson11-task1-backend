const { Subject, BehaviorSubject, timer, map, scan, filter, shareReplay, distinctUntilChanged, last} = require('rxjs');
const { creatingMessage } = require('../api/creatingMessage.js');

class StreamMessages {
	constructor(store) {	
		this.timerRequests = {
			id: null,
			time: 600000,
		}
		this.subscriptions = {
			requests$: [],
			timerMessages$: [],
			messages$: [],
			state$: []
		}
		
		this.requests$ = new Subject();
		this.store$ = new BehaviorSubject();
		this.timerMessages$ = timer(150, 15000);
		this.messages$ = new Subject().pipe(
			scan((oldStore, action) => this.updateStore(oldStore, action), store),
			shareReplay(),
			map(value => {
				this.store$.next(value);
				return value;
			})
		);
	
		this.startTimerRequest();
		this.startGenerationMessages();
		this.startHandlerMessages();
	}

	startTimerRequest() {
		console.log('starting');

		this.timerRequests.id = setTimeout(() => this.stopTimerRequest(), this.timerRequests.time);
		const subscription = this.requests$.subscribe({
			next: this.reStartTimerRequest.bind(this)
		});

		this.subscriptions.requests$.push(subscription);
	}

	startGenerationMessages() {
		this.createGenNewMessages();
	}

	startHandlerMessages() {
		const subscription = this.messages$.subscribe();

		this.subscriptions.messages$.push(subscription);
	}

	reStartTimerRequest() {	
		console.log('restarting');
		clearTimeout(this.timerRequests.id);

		if(this.subscriptions.timerMessages$.length === 0) {
			this.createGenNewMessages()
		}

		this.timerRequests.id = setTimeout(() => this.stopTimerRequest(), this.timerRequests.time)
	}

	stopTimerRequest() {
		clearTimeout(this.timerRequests.id);
		this.removeGenNewMessages();		
		this.timerRequests.id = null;
		this.messages$.next({
			type: 'clear'
		})

		console.log('stopping')
	}

	createGenNewMessages() {
		if(this.subscriptions.timerMessages$.length > 0) {
			this.removeGenNewMessages();
		}

		const subscription = this.timerMessages$.subscribe({
			next: this.creatingNewMessage.bind(this),
		});

		this.subscriptions.timerMessages$.push(subscription);
	}

	removeGenNewMessages() {
		this.subscriptions.timerMessages$.forEach(item => item.unsubscribe());
		this.subscriptions.timerMessages$ = [];
	}

	creatingNewMessage() {
		const message = creatingMessage();
		this.addNewMessageToStream(message);
	}

	addNewMessageToStream(message) {
		const action = {
			type: 'add',
			messages: {
				new: message,				
			}
		}
		
		this.messages$.next(action)
	}

	clearSubscriptions() {
		for(let key in this.subscriptions) {
			this.subscriptions[key].forEach(item => item.unsubscribe);
			this.subscriptions[key] = [];
		}
	}
	
	async getStore() {
		let tempSubscribe; 
		const messages = await new Promise(async res => {
			tempSubscribe = this.store$.subscribe({
				next: value => {
					res(value)
				}
			})
		})

		tempSubscribe.unsubscribe();
		return messages;
	}

	async setStore(type, messages) {
		const action = {
			type
		}

		if(messages) {
			action.messages = messages
		}

		this.messages$.next(action)
	}
	
	updateStore(oldStore, action) {
		switch(action.type) {
			case 'add':
				return {
					sent: oldStore.sent,
					unsent: [...oldStore.unsent, action.messages.new]
				}

			case 'sending': 
				return {
					sent: [...oldStore.sent, ...oldStore.unsent],
					unsent: []
				}

			case 'clear':
				return {
					sent: [],
					unsent: []
				}
				
			default:
				return oldStore;
		}
	}
}

const createStreams = async (store) => {
	return new StreamMessages(store)
}

module.exports = {
	createStreams,
}