# Developing
```
dev_appserver.py --host 0.0.0.0 .
 
npm install -g protractor
webdriver-manager update
webdriver-manager start
protractor conf.js
```

# Running in Production
`appcfg.py update --oauth2 .`

`backup/backup.py`

# Notes
x = logged window.performance.timing;
z = []; for (k in x) { t = x[k]; if (t > 0) { z.push([t - x.navigationStart, k]) }}; z.sort().map(function(pair) { return pair[1] + ": " + pair[0]})

# To Do
- Add virtual no project project
- Give projects default context
- Deactivating projects
- Fix desktop "scrolling" by keyboard

# Bugs that I don't care that much about
- Remote task completions trigger notifications.
- Add jsonp and csrf protection- http://docs.angularjs.org/api/ng.$http
- Awesome smashing animation when completing a task.
- Simplify schema and merging to be lasts write wins on the whole object.
