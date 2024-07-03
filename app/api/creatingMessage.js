const { faker } = require('@faker-js/faker');

class Message {
	constructor() {
		this.id = faker.string.uuid();
		this.address = faker.internet.email();
		this.subject = faker.lorem.lines(1);
		this.body = faker.lorem.paragraph({ min: 1, max: 3 });
		this.time = Date.now();
	}
}

const creatingMessage = () => {
	return new Message()
}

module.exports = {
	creatingMessage
}
