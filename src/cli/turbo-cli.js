#!/usr/bin/env node

const [, , ...args] = process.argv;

console.debug(`Command: ${args[0]}`); // eslint-disable-line no-console

try {
	const command = require(`./commands/${args[0]}`); // eslint-disable-line import/no-dynamic-require, global-require
	command();
} catch (ex) {
	console.log(ex); // eslint-disable-line no-console
}
