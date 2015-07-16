exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['desktop-spec.js'],
	capabilities: {
		browserName: 'chrome'
	}
};
