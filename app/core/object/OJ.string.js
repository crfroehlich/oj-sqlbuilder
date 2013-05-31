/*global OJ:true*/
(function() {

    OJ.delimitedString = OJ.delimitedString ||
        OJ.lift('delimitedString', function (string, opts) {
            var OJInternal = {
                newLineToDelimiter: true,
                spaceToDelimiter: true,
                removeDuplicates: true,
                delimiter: ',',
                initString: OJ.to.string(string)
            };

            var OJReturn = {
                array: [],
                delimited: function () {
                    return OJReturn.array.join(OJInternal.delimiter);
                },
                string: function (delimiter) {
                    delimiter = delimiter || OJInternal.delimiter;
                    var ret = '';
                    OJ.each(OJReturn.array, function (val) {
                        if (ret.length > 0) {
                            ret += delimiter;
                        }
                        ret += val;
                    });
                    return ret;
                },
                toString: function () {
                    return OJReturn.string();
                },
                add: function (str) {
                    OJReturn.array.push(OJInternal.parse(str));
                    OJInternal.deleteDuplicates();
                    return OJReturn;
                },
                remove: function (str) {
                    var remove = function (array) {
                        return array.filter(function (item) {
                            if (item !== str) {
                                return true;
                            }
                        });
                    };
                    OJReturn.array = remove(OJReturn.array);
                    return OJReturn;
                },
                count: function() {
                    return OJReturn.array.length;
                },
                contains: function (str, caseSensitive) {
                    var isCaseSensitive = OJ.to.bool(caseSensitive);
                    str = OJ.string(str).trim();
                    if (false === isCaseSensitive) {
                        str = str.toLowerCase();
                    }
                    var match = OJReturn.array.filter(function (matStr) {
                        return ((isCaseSensitive && OJ.to.string(matStr).trim() === str) || OJ.to.string(matStr).trim().toLowerCase() === str);
                    });
                    return match.length > 0;
                },
                each: function(callBack) {
                    return OJReturn.array.forEach(callBack);
                }
            };

            OJInternal.parse = function (str) {
                var ret = OJ.to.string(str);

                if (OJInternal.newLineToDelimiter) {
                    while (ret.indexOf('\n') !== -1) {
                        ret = ret.replace(/\n/g, OJInternal.delimiter);
                    }
                }
                if (OJInternal.spaceToDelimiter) {
                    while (ret.indexOf(' ') !== -1) {
                        ret = ret.replace(/ /g, OJInternal.delimiter);
                    }
                }
                while (ret.indexOf(',,') !== -1) {
                    ret = ret.replace(/,,/g, OJInternal.delimiter);
                }
                return ret;
            };

            OJInternal.deleteDuplicates = function () {
                if (OJInternal.removeDuplicates) {
                    (function () {

                        var unique = function (array) {
                            var seen = new Set();
                            return array.filter(function (item) {
                                if (false === seen.has(item)) {
                                    seen.add(item);
                                    return true;
                                }
                            });
                        };

                        OJReturn.array = unique(OJReturn.array);
                    }());
                }
            };

            (function (a) {
                if (a.length > 1 && false === OJ.is.plainObject(opts)) {
                    OJ.each(a, function (val) {
                        if (false === OJ.is.nullOrEmpty(val)) {
                            OJReturn.array.push(val);
                        }
                    });
                } else if(string && string.length > 0) {
                    OJ.extend(OJInternal, opts);
                    var delimitedString = OJInternal.parse(string);
                    OJInternal.initString = delimitedString;
                    OJReturn.array = delimitedString.split(OJInternal.delimiter);
                }

                OJInternal.deleteDuplicates();
            }(arguments));
            return OJReturn;
        });
}());