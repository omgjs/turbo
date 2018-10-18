#!/usr/bin/env node

const [, , ...args] = process.argv;

console.debug(`Parameters: ${args}`); // eslint-disable-line no-console

const webpack = require("webpack");

const webpackConfig = require("@omgjs/webpack-config-react");

webpack(webpackConfig, (err, stats) => {
	if (err || stats.hasErrors()) {
		console.debug(err, stats.toString()); // eslint-disable-line no-console
		// Handle errors here
	}
	// Done processing
});
