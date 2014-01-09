import logging

from google.appengine.api import users
from google.appengine.ext import db
import webapp2
from webapp2_extras import json

from models import VersionedText
import settings


def require_auth(func):
    """A decorator."""
    def new_func(self):
        user = users.get_current_user()
        if not user:
            self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
            self.response.out.write(json.encode({
                'status': 'NEED_LOGIN',
                'url': users.create_login_url("/"),
            }))
        else:
            func(self)
    return new_func


class MainPage(webapp2.RequestHandler):
    def get(self):
        self.redirect('client/index.html')


class StorageApi(webapp2.RequestHandler):
    @require_auth
    def get(self):
        versioned_text = self._get_versioned_text()
        if self.request.get('forceDownload') == 'true':
            content_type = 'application/octet-stream'
        else:
            content_type = 'application/json'
        self.response.headers.add_header('content-type', content_type, charset='utf-8')
        self.response.out.write(json.encode({
            'status': 'OK',
            'text': versioned_text.text,
            'version': versioned_text.version,
        }))

    @require_auth
    def post(self):
        # TODO prevent CSRF by requiring a token provided by get()
        resp = self.save_value()
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        self.response.out.write(json.encode(resp))

    def _get_versioned_text(self):
        user_id = users.get_current_user().user_id()
        versioned_text = db.get(db.Key.from_path('VersionedText', str(user_id)))
        if versioned_text is None:
            versioned_text = VersionedText(key_name=str(user_id), text='', version=0)
        return versioned_text

    @db.transactional
    def save_value(self):
        try:
            data = json.decode(self.request.body)
            text = data['text']
            last_saved_version = data['lastSavedVersion']
        except KeyError:
            return {'status': 'MISSING_ARG'}
        versioned_text = self._get_versioned_text()
        if str(versioned_text.version) != str(last_saved_version):
            return {'status': 'DATA_CHANGED'}
        if versioned_text.text != text:
            versioned_text.text = text
            versioned_text.version += 1
            versioned_text.put()
        return {
            'status': 'OK',
            'lastSavedVersion': versioned_text.version,
        }


class LoggingApi(webapp2.RequestHandler):
    @require_auth
    def post(self):
        logging.info(self.request.body)
        self.response.out.write("OK")


app = webapp2.WSGIApplication([
    ('/api/storage', StorageApi),
    ('/api/log', LoggingApi),
    ('/', MainPage),
], debug=settings.DEBUG)
