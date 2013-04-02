from google.appengine.ext import db

class Value(db.Model):
    value = db.TextProperty()
    last_saved_version = db.IntegerProperty(indexed=False)
