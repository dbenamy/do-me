from google.appengine.ext import db


class VersionedText(db.Model):
    text = db.TextProperty()
    version = db.IntegerProperty(indexed=False)
