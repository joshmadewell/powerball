'use strict';

const Entrant = require('./entrant');
const Ticket = require('./ticket');
const Table = require('easy-table');

class Pool {
	constructor() {
		let self = this;
		self.entrants = [];
		self.tickets = [];
		self.totalContribution = 0;
		self.totalPrizePool = 0;
	}

	resetEntrants() {
		let self = this;
		self.entrants = [];
		self.totalContribution = 0;
	}

	resetTickets() {
		let self = this;
		self.tickets = [];
		self.totalPrizePool = 0;
	}

	addEntrant(name, contribution) {
		let self = this;
		self.entrants.push(new Entrant({ name: name, contribution: contribution }));
		self.totalContribution += contribution;
		_applyWinningPercentages(self);
	}

	deleteEntrant(index) {
		let self = this;
		let entrantToDelete = self.entrants[index];
		self.totalContribution -= entrantToDelete.contribution;
		self.entrants.splice(index, 1);
		_applyWinningPercentages(self);
	}

	addTicket(whiteballs, powerball) {
		let self = this;
		whiteballs.push(powerball);
		self.tickets.push(new Ticket(whiteballs));
	}

	deleteTicket(index) {
		let self = this;
		let ticketToDelete = self.tickets[index];
		if (ticketToDelete.winnings) {
			self.totalPrizePool -= ticketToDelete.winnings;
		}

		self.tickets.splice(index, 1);
	}

	prettyPrintEntrants() {
		let self = this;
		let table = new Table();
		self.entrants.forEach((entrant, index) => {
			table.cell('#', (index + 1) + '.');
			table.cell('Name', entrant.name);
			table.cell('Contribution', entrant.contribution);
			table.cell('Winning Percentage', entrant.winningPercentage);
			table.cell('Total Winnings', self.totalPrizePool * entrant.winningPercentage);
			table.newRow();
		});

		console.log(table.toString());
	}

	prettyPrintTickets() {
		let self = this;
		let table = new Table();
		self.tickets.forEach((ticket, index) => {
			table.cell('#', (index + 1) + '.');
			ticket.whiteballs.forEach((number, index) => {
				table.cell('n' + (index + 1), number);
			});
			table.cell('PB', ticket.powerball);
			table.newRow();
		});

		console.log(table.toString());
	}

	calculateTotalWinnings(winningWhiteballs, winningPowerball) {
		let self = this;
		let wonJackpot = false;
		winningWhiteballs.push(winningPowerball);
		self.tickets.forEach((ticket) => {
			let winnings = ticket.calculateWinnings(winningWhiteballs);
			if (winnings === 'JACKPOT') {
				wonJackpot = true;
			} else {
				self.totalPrizePool += winnings;
			}
		});

		if (wonJackpot) {
			self.totalPrizePool *= -1;
		}

		return self.totalPrizePool;
	}
}

function _applyWinningPercentages(pool) {
	pool.entrants.forEach((entrant) => {
		entrant.winningPercentage = (entrant.contribution / pool.totalContribution);
	});
}

module.exports = Pool;
