'use strict';

const prompt = require('prompt');
const Converter = require("csvtojson").Converter;
const converter = new Converter({
	delimiter: '\t',
	noheader: true
});
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
			pattern: /^[print-|delete-]*entrant[s]*$|^[print-|delete-]*ticket[s]*$|^winner$|^file$|^reset$/i,
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

const FILE_PATH = {
	properties: {
		filePath:  {
			required: true
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
		pool.prettyPrintEntrants();
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

function _enterFilePath() {
	prompt.get(FILE_PATH, (error, result) => {
		if (error) return _cancelled(error);

		let hasTicketId = false;
		try {
			converter.fromFile(result.filePath, (error, result) => {
				if (result === undefined ||
					result[0] === undefined ||
					result[0].field1 === undefined ||
					result[0].field2 === undefined ||
					result[0].field3 === undefined ||
					result[0].field4 === undefined ||
					result[0].field5 === undefined ||
					result[0].field6 === undefined) {
					console.log('Error parsing file.');
					return _getActionPrompt();
				}

				if (result[0].field7 !== undefined) {
					hasTicketId = true;
				}

				result.forEach((ticket) => {
					let ticketWhites, powerball;
					if (hasTicketId) {
						ticketWhites = [ticket.field2, ticket.field3, ticket.field4, ticket.field5, ticket.field6];
						powerball = ticket.field7;
						pool.addTicket(ticketWhites, powerball, ticket.field1);
					} else {
						ticketWhites = [ticket.field1, ticket.field2, ticket.field3, ticket.field4, ticket.field5];
						powerball = ticket.field6;
						pool.addTicket(ticketWhites, powerball);
					}
				});

				_getActionPrompt();
			});
		} catch (e) {
			console.log('Error parsing file.');
			_getActionPrompt();
		}
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
	console.log("-- Enter tickets from file: 'file'");
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
			case 'file':
				_enterFilePath();
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
