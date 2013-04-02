import logging
import os

APP_ENV = 'PROD'
if os.environ.get('SERVER_SOFTWARE', '') == 'Development/1.0':
	APP_ENV = 'DEV'
logging.info("Running in %s environment." % APP_ENV)

DEBUG = APP_ENV == 'DEV'

if APP_ENV == 'DEV':
	AUTHORIZED_USER_IDS = [
		'185804764220139124118',
	]
else:
	AUTHORIZED_USER_IDS = [
		'111846047130970097150', # dbenamy@gmail.com
	]