all: compiled-mobile.js compiled-desktop.js

compiled-mobile.js:
	cd client && \
	closure-compiler \
	--language_in=ECMASCRIPT5 \
	--js=libs/angular-1.2.29.min.js \
	--js=libs/localforage-1.2.3.min.js \
	--js=libs/angular-localforage-1.2.3.min.js \
	--js=libs/angular-touch-1.2.16.min.js \
	--js=libs/backup-0.2.js \
	--js=libs/mobile-angular-ui-1.1.0-beta.22/mobile-angular-ui.min.js \
	--js=libs/sprintf-0.5.js \
	--js=libs/humanized_time_span.js \
	--js=libs/message/message.js \
	--js=setup-mobile.js \
	--js=application-cache.js \
	--js=db.js \
	--js=storage.js \
	--js=net.js \
	--js=search.js \
	--js=sync.js \
	--js=tasks.js \
	--js=message_ctrl.js \
	--js=search_ctrl.js \
	--js=sync_ctrl.js \
	--js=tags_ctrl.js \
	--js=tasks_ctrl.js \
	--js_output_file=compiled-mobile.js \
	--create_source_map=compiled-mobile.js.map && \
	echo "//# sourceMappingURL=compiled-mobile.js.map" >> compiled-mobile.js

compiled-desktop.js:
	cd client && \
	closure-compiler \
	--language_in=ECMASCRIPT5 \
	--js=libs/angular-1.2.29.min.js \
	--js=libs/localforage-1.2.3.min.js \
	--js=libs/angular-localforage-1.2.3.min.js \
	--js=libs/backup-0.2.js \
	--js=libs/keymaster.min.js \
	--js=libs/mobile-angular-ui-1.1.0-beta.22/mobile-angular-ui.min.js \
	--js=libs/sprintf-0.5.js \
	--js=libs/humanized_time_span.js \
	--js=libs/message/message.js \
	--js=setup-desktop.js \
	--js=application-cache.js \
	--js=db.js \
	--js=storage.js \
	--js=net.js \
	--js=search.js \
	--js=sync.js \
	--js=tasks.js \
	--js=message_ctrl.js \
	--js=search_ctrl.js \
	--js=sync_ctrl.js \
	--js=tags_ctrl.js \
	--js=tasks_ctrl.js \
	--js_output_file=compiled-desktop.js \
	--create_source_map=compiled-desktop.js.map && \
	echo "//# sourceMappingURL=compiled-desktop.js.map" >> compiled-desktop.js
