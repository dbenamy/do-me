import logging

from google.appengine.api import users
from google.appengine.ext import db
import webapp2
from webapp2_extras import json

from models import Value
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
        elif user.user_id() not in settings.AUTHORIZED_USER_IDS:
            logging.warn("User %s tried to access the server and isn't authorized." % user.user_id())
            self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
            self.response.out.write(json.encode({
                'status': 'NOT_AUTHORIZED',
                'userId': user.user_id(),
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
        task_storage = self.get_storage()
        if self.request.get('forceDownload') == 'true':
            content_type = 'application/octet-stream'
        else:
            content_type = 'application/json'
        self.response.headers.add_header('content-type', content_type, charset='utf-8')
        self.response.out.write(json.encode({
            'status': 'OK',
            'value': task_storage.value,
            'lastSavedVersion': task_storage.last_saved_version,
        }))

    @require_auth
    def post(self):
        # TODO prevent CSRF by requiring a token provided by get()
        resp = self.save_value()
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        self.response.out.write(json.encode(resp))

    def get_storage(self):
        user_id = users.get_current_user().user_id()
        task_storage = db.get(db.Key.from_path('Value', str(user_id)))
        if task_storage is None:
            task_storage = Value(key_name=str(user_id), value='', last_saved_version=0)
        return task_storage

    @db.transactional
    def save_value(self):
        value = self.request.get('value')
        last_saved_version = self.request.get('lastSavedVersion')
        if value == '' or last_saved_version == '':
            return {'status': 'MISSING_ARG'}
        task_storage = self.get_storage()
        if str(task_storage.last_saved_version) != last_saved_version:
            return {'status': 'DATA_CHANGED'}
        if task_storage.value != value:
            task_storage.value = value
            task_storage.last_saved_version += 1
            task_storage.put()
        return {
            'status': 'OK',
            'lastSavedVersion': task_storage.last_saved_version,
        }


app = webapp2.WSGIApplication([
    ('/api/storage', StorageApi),
    ('/', MainPage),
], debug=settings.DEBUG)
