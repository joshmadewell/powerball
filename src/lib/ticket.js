'use strict';

const WINNING_COMBINATIONS = [
	{ white: 5, powerball: true, winnings: 'JACKPOT' },
	{ white: 5, powerball: false, winnings: 1000000 },
	{ white: 4, powerball: true, winnings: 50000 },
	{ white: 4, powerball: false, winnings: 100 },
	{ white: 3, powerball: true, winnings: 100 },
	{ white: 3, powerball: false, winnings: 7 },
	{ white: 2, powerball: true, winnings: 7 },
	{ white: 1, powerball: true, winnings: 4 },
	{ white: 0, powerball: true, winnings: 4 }
];

class Ticket {
	constructor(numbers, id) {
		let self = this;
		self.powerball = numbers.pop();
		self.whiteballs = numbers;
		self.id = id;
	}

	toString() {
		let self = this;
		return (self.id ? '#' + self.id + ' ' : '') + self.whiteballs.join(' ') + ' ' + self.powerball + ' -- $' + self.winnings;
	}

	calculateWinnings(winningNumbers) {
		let self = this;

		let winnings = 0;
		let winningPowerball = winningNumbers.slice(5, 6)[0];
		let winningWhiteballs = winningNumbers.slice(0, 5);
		let whiteBallsClone = self.whiteballs.slice(0, 5);

		let matchingWhiteBalls = 0;
		winningWhiteballs.forEach((winningWhite) => {
			let index = whiteBallsClone.indexOf(winningWhite);
			if (index !== -1) {
				whiteBallsClone.splice(index, 1);
				matchingWhiteBalls++;
			}
		});

		let matchingPowerball = winningPowerball === self.powerball;

		WINNING_COMBINATIONS.forEach((combination) => {
			if (!winnings && combination.white === matchingWhiteBalls && combination.powerball === matchingPowerball) {
				winnings = combination.winnings;
			}
		});

		self.winnings = winnings;
		return winnings;
	}
}

module.exports = Ticket;
