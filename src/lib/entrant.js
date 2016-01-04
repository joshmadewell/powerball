'use strict';

class Entrant {
	constructor(options) {
		let self = this;
		self.name = options.name;
		self.contribution = options.contribution;
		self.winnings = null;
		self.winningPercentage = null;
	}
}

module.exports = Entrant;
