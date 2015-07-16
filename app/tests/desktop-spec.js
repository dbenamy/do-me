describe('adding a tag', function() {
	it('should show up in the list', function() {
		browser.get('http://localhost:8080/client/desktop.html#!/?sync=false');

		element.all(by.css('.test-tag-list')).then(function(items) {
			expect(items.length).toBe(0);
		}).then(function() {
			element(by.css('.test-new-tag')).sendKeys('#Pie');
			element(by.css('.test-add-tag')).click();
		}).then(function() {
			return element.all(by.css('.test-tag-list'));
		}).then(function(items) {
			expect(items.length).toBe(1);
			expect(items[0].getText()).toBe('#Pie');
		});
	});
});
