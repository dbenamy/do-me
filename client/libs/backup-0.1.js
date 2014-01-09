/**
 * backup.js - https://bitbucket.org/dbenamy/backup.js
 *
 * Copyright 2014 Daniel Benamy
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/


// From https://github.com/es-shims/es5-shim/blob/v2.0.5/es5-shim.js#L544
// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if (
            (typeof object != "object" && typeof object != "function") ||
            object === null
        ) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };
}

// From https://github.com/es-shims/es5-shim/blob/v2.3.0/es5-shim.js#L415
// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                    object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}


// From https://github.com/es-shims/es5-shim/blob/v2.3.0/es5-shim.js#L389
// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, object);
        }
        return result;
    };
}

/////////////////////////////////////////////////////////////////////

var backupjs = function() {
	var PREFIX = 'backupjs-';

	var debug = function(msg) {
		// Uncomment for debugging.
		// console.log(msg);
	};

	var debugKeysMs = function(setOfMs) {
		Object.keys(setOfMs).map(function(ms) {
			var date = new Date(parseInt(ms, 10));
			var utc = date.toUTCString();
			debug("  " + utc);
		});
	};

	var fakeNow = null; // so tests can override it

	/**
	 * Only for use by tests.
	 **/
	var setNowDate = function(fakeDate) {
		fakeNow = new Date(fakeDate.getTime());
	};

	var getNowDate = function() {
		if (fakeNow !== null) {
			return fakeNow;
		} else {
			return new Date();
		}
	};

	/**
	 * Load the data backed up at the given Date() without JSON parsing it.
	 **/
	var loadRaw = function(date) {
		return localStorage.getItem(PREFIX + date.getTime());
	};

	/**
	 * Load the data backed up at the given Date().
	 **/
	var load = function(date) {
		return JSON.parse(loadRaw(date));
	};

	/**
	 * Returns an array of the Dates of all backups, in order, with the newest
	 * first.
	 **/
	var list = function() {
		var storedKeys = Object.keys(localStorage);
		var backupKeys = storedKeys.filter(function(key) {
			return key.slice(0, PREFIX.length) === PREFIX;
		});
		
		var timestamps = backupKeys.map(function(key) {
			var ts = key.slice(PREFIX.length);
			return parseInt(ts, 10);
		});
		timestamps.sort(function(a, b) {
			return b - a;
		});

		var dates = timestamps.map(function(timestamp) {
			return new Date(timestamp);
		});

		debug("list() returning " + dates.length + " backups:");
		for (var i = 0; i < dates.length; i++) {
			debug("  " + dates[i].toUTCString() + ", " + dates[i].getTime());
		}
		return dates;
	};

	/**
	 * For clearing backups between tests.
	 **/
	var deleteAllBackups = function() {
		debug("Deleting all backups.");
		list().map(function(backupDate) {
			debug("Deleting backup " + backupDate.toUTCString());
			localStorage.removeItem(PREFIX + backupDate.getTime());
			return null;
		});
	};

	/**
	 * See pruneBackups().
	 **/
	var datesToDelete = function(datesNewestFirst) {
		var now = getNowDate();
		var toKeepMs = {}; // used as a set

		var doneHours = {};
		var oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		for (var i = 0; i < datesNewestFirst.length && datesNewestFirst[i] > oneDayAgo; i++) {
			var hour = datesNewestFirst[i].getUTCHours();
			if (!doneHours[hour]) {
				toKeepMs[datesNewestFirst[i].getTime()] = true;
				doneHours[hour] = true;
			}
		}
		// debug("After hour ranges, toKeepMs is:"); debugKeysMs(toKeepMs);

		var doneDays = {};
		var nineDaysAgo = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000);
		// This may get one extra or one fewer daily backup during DST changes
		// and other time anomolies because of day boundary skew. TODO Prevent
		// this?
		for (i = 0; i < datesNewestFirst.length && datesNewestFirst[i] >= nineDaysAgo; i++) {
			var day = datesNewestFirst[i].getUTCDate();
			if (!doneDays[day]) {
				toKeepMs[datesNewestFirst[i].getTime()] = true;
				doneDays[day] = true;
			}
		}
		// debug("After day ranges, toKeepMs is:"); debugKeysMs(toKeepMs);

		var doneMonths = {};
		for (i = 0; i < toKeepMs.length; i++) {
			doneMonths[(new Date(toKeepMs[i])).getUTCMonth()] = true;
		}
		for (var j = 0; j < datesNewestFirst.length && Object.keys(doneMonths).length < 12; j++) {
			var month = datesNewestFirst[j].getUTCMonth();
			if (!doneMonths[month]) {
				toKeepMs[datesNewestFirst[j].getTime()] = true;
				doneMonths[month] = true;
			}
		}
		// debug("After month, toKeepMs is:"); debugKeysMs(toKeepMs);

		var toDelete = [];
		for (i = datesNewestFirst.length - 1; i >= 0; i--) {
			if (!(toKeepMs.hasOwnProperty(datesNewestFirst[i].getTime()))) {
				toDelete.push(datesNewestFirst[i]);
			}
		}
		// debug("toDelete is:"); debug(toDelete);

		return toDelete;
	};

	/**
	 * Save 1 backup / hr for the last 24 hrs, 1 / day for the last 10 days,
	 * and 1 / month up to 12 monthly backups.
	 * 
	 * Delete anything else.
	 **/
	var pruneBackups = function() {
		var backupDates = list();
		var toDeleteDates = datesToDelete(backupDates);
		debug("Deleting " + toDeleteDates.length + " unneeded backups:");
		for (var i = toDeleteDates.length - 1; i >= 0; i--) {
			debug("  " + toDeleteDates[i].toUTCString() + ", " + toDeleteDates[i].getTime());
			localStorage.removeItem(PREFIX + toDeleteDates[i].getTime());
		}
	};

	/**
	 * Runs backup and cleans old backups.
	 *
	 * Runs the backup first so it doesn't delete any old backups unless there's
	 * definitely a new one.
	 *
	 * Runs JSON.stringify on data. Make sure everything in data can be stringified.
	 * If you have Date objects in there and want this to work on older browsers,
	 * add a Date.toJSON(). The es5-shim library can do that
	 * (https://github.com/es-shims/es5-shim).
	 *
	 * Can throw an exception for QuotaExceededError or FutureBackupError.
	 **/
	var backup = function(data) {
		var dataJson = JSON.stringify(data);
		
		debug("Checking that there are no backups from the future.");
		var backupDates = list();
		if (backupDates.length > 0 && backupDates[0] > getNowDate()) {
			throw {
				name: 'FutureBackupError',
				message: 'backup.js found a saved backup with a timestamp in the future (' + backupDates[0] + '). Aborting backup to prevent data loss in case of a bug or a computer with wrong time.'
			};
		}

		debug("Saving backup.");
		localStorage.setItem(PREFIX + getNowDate().getTime(), dataJson);

		debug("Pruning backups.");
		pruneBackups();
	};

	return {
		backup: backup,
		list: list,
		load: load,
		privateFunctions: { // exposed for debugging and unit testing
			deleteAllBackups: deleteAllBackups,
			setNowDate: setNowDate,
			pruneBackups: pruneBackups,
			datesToDelete: datesToDelete
		}
	};
}();
