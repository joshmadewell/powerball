'use strict';

const prompt = require('prompt');
const Pool = require('./lib/pool');

const NUMBER_PROMPT = {
	properties: {
		number: {
			pattern: /\d+/,
			required: true,
			type: 'number'
		}
	}
};

const TICKET_PROMPT = {
	properties: {
		1: {
			pattern: /\d+/,
		 	required: true,
			type: 'number'
		},
		2: {
			pattern: /\d+/,
		 	required: true,
			type: 'number'
		},
		3: {
			pattern: /\d+/,
		 	required: true,
			type: 'number'
		},
		4: {
			pattern: /\d+/,
		 	required: true,
			type: 'number'
		},
		5: {
			pattern: /\d+/,
		 	required: true,
			type: 'number'
		},
		pb: {
			pattern: /\d+/,
		 	required: true,
			type: 'number'
		},
	}
};

const ACTION_PROMPT = {
	properties: {
		action: {
			pattern: /^[print-|delete-]*entrant[s]*$|^[print-|delete-]*ticket[s]*$|^winner$|^reset$/i,
			required: true
		}
	}
};

const ENTRANTS_PROMPT = {
	properties: {
		name: {
			required: true
		},
		contribution: {
			pattern: /\d+/,
			required: true,
			type: 'number'
		}
	}
};

const CONTINUE_PROMPT = {
	properties: {
		another: {
			description: 'Enter Another? (y/n)',
			default: 'y',
			pattern: /^y$|^n$/i
		}
	}
};

let pool = new Pool();

prompt.start();

function _cancelled(error) {
	if (error.message === 'canceled') {
		_getActionPrompt();
	}
}

function _enterEntrants() {
	prompt.get(ENTRANTS_PROMPT, (error, result) => {
		if (error) return _cancelled(error);

		pool.addEntrant(result.name, result.contribution);
		console.log("Current Entrants:", pool.entrants.length, 'Current Contributions: ', pool.totalContribution);
		prompt.get(CONTINUE_PROMPT, (error, result) => {
			if (result.another === 'n') {
				_getActionPrompt();
			} else {
				_enterEntrants();
			}
		});
	});
}

function _enterTickets() {
	prompt.get(TICKET_PROMPT, (error, result) => {
		if (error) return _cancelled(error);

		var ticketWhites = [result[1], result[2], result[3], result[4], result[5]];
		var powerball = result.pb;
		pool.addTicket(ticketWhites, powerball);

		prompt.get(CONTINUE_PROMPT, (error, result) => {
			if (result.another === 'n') {
				_getActionPrompt();
			} else {
				_enterTickets();
			}
		});
	});
}

function _enterWinningTicket() {
	prompt.get(TICKET_PROMPT, (error, result) => {
		if (error) return _cancelled(error);

		var ticketWhites = [ result[1], result[2], result[3], result[4], result[5] ];
		var powerball = result.pb;
		pool.calculateTotalWinnings(ticketWhites, powerball);
		console.log('Total Winnings:', pool.totalPrizePool);
		_getActionPrompt();
	});
}

function _deleteEntrantPrompt() {
	pool.prettyPrintEntrants();
	console.log('Which entrant would you like to delete?');
	prompt.get(NUMBER_PROMPT, (error, result) => {
		if (error) return _cancelled(error);

		pool.deleteEntrant(result.number - 1);
		pool.prettyPrintEntrants();
		_getActionPrompt();
	});
}

function _deleteTicketPrompt() {
	pool.prettyPrintTickets();
	console.log('Which ticket would you like to delete?');
	prompt.get(NUMBER_PROMPT, (error, result) => {
		if (error) return _cancelled(error);

		pool.deleteTicket(result.number - 1);
		pool.prettyPrintTickets();
		_getActionPrompt();
	});
}


function _getActionPrompt() {
	console.log("What would you like to do?");
	console.log("-- Enter Entrants: 'entrants'");
	console.log("-- Print Entrants: 'print-entrants'");
	console.log("-- Delete Entrant: 'delete-entrant'");
	console.log("-- Enter Tickets: 'tickets'");
	console.log("-- Print Tickets: 'print-tickets'");
	console.log("-- Delete Ticket: 'delete-ticket'");
	console.log("-- Enter Winning Ticket: 'winner'");
	console.log("-- Reset Pool: 'reset'");
	console.log("-- ^d to quit");
	prompt.get(ACTION_PROMPT, (error, result) => {
		if (error) return _cancelled(error);

		switch (result.action) {
			case 'entrants':
				_enterEntrants();
				break;
			case 'print-entrants':
				pool.prettyPrintEntrants();
				_getActionPrompt();
				break;
			case 'delete-entrant':
				_deleteEntrantPrompt();
				break;
			case 'tickets':
				_enterTickets();
				break;
			case 'print-tickets':
				pool.prettyPrintTickets();
				_getActionPrompt();
				break;
			case 'delete-ticket':
				_deleteTicketPrompt();
				break;
			case 'winner':
				_enterWinningTicket();
				break;
			case 'reset':
				pool.resetTickets();
				pool.resetEntrants();
				_getActionPrompt();
				break;
			default:
				_getActionPrompt();
		}
	});
}

_getActionPrompt();
