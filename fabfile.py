#from __future__ import with_statement
from fabric.api import *
from fabric.contrib.console import confirm

env.hosts = ['web136.webfaction.com']
env.app_dirs = {
    'qa': 'qa_django',
    'prod': 'django',
}

def test():
    with settings(warn_only=True):
        result = local('./manage.py test my_app', capture=False)
    if result.failed and not confirm("Tests failed. Continue anyway?"):
        abort("Aborting at user request.")

def pack():
    local('tar czf staging.tgz .', capture=False)

def deploy():
    put('/tmp/my_project.tgz', '/tmp/')
    with cd('/srv/django/my_project/'):
        run('tar xzf /tmp/my_project.tgz')
        run('touch app.wsgi')

def restart_apache(where):
    run('webapps/%s/apache2/bin/restart' % env.app_dirs[where])
