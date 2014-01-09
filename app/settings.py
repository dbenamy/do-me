import logging
import os

APP_ENV = 'PROD'
if os.environ.get('SERVER_SOFTWARE', '') == 'Development/1.0':
    APP_ENV = 'DEV'
logging.info("Running in %s environment." % APP_ENV)

DEBUG = APP_ENV == 'DEV'
