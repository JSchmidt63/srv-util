"use strict";

const assert = require("assert");

const Exception = require("srv-core").Exception;

/**
 * Class holds various utility methods.
 */
class Util {

    /**
     * Concatenates passed parameters.
     * <code>undefined</code> and <code>null</code> values represented as empty strings.
     *
     * @param {...*} - values to concatenate
     * @return {string} Concatenated value.
     */
    static concatenate() {
        let ret = "";
        for (let i = 0, l = arguments.length; i < l; i++) {
            if (arguments[i] !== undefined && arguments[i] !== null) {
                ret += arguments[i];
            }
        }
        return ret;
    }

    /**
     * Makes shallow copy of specified object.
     * If <code>Array</code> is passed - creates copies of all objects in source array and
     * returns new <code>Array</code> instance with copied objects.
     * If <code>includeProperties</code> is specified - returned object will contain only properties specifed in it.
     * If <code>obj</code> is not an object - returns <code>obj</code>.
     *
     * @param {object|Array} obj - Source object or array of source objects
     * @param {string[]} [includeProperties=[]] - Array of properties to include
     * @return {object|Array} Shallow copy of specified object or array of shallow copied objects
     */
    static objectCopy(obj, includeProperties = []) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        let source;
        if (Array.isArray(obj)) {
            source = obj;
        } else {
            source = [obj];
        }
        if (!Array.isArray(includeProperties)) {
            includeProperties = [];
        }
        const result = [];
        for (let i = 0, l = source.length; i < l; i++) {
            const r = {};
            for (let key in source[i]) {
                if (includeProperties.includes(key)) {
                    r[key] = source[i][key];
                }
            }
            result.push(r);
        }
        if (Array.isArray(obj)) {
            return result;
        } else {
            return result[0];
        }
    }

    /**
     * Synchronously execute task with every element in paramArray.
     *
     * @param {Array} paramArray - List of parameters to execute task with
     * @param {boolean} stopOnError - If <code>true</code> stops execution if task calls callback with error and returns acquired results;
     *      if <code>false</code> - executes task with all parameters.
     * @param {function} task - Task to execute. Function is executed with following parameters:
     *      <ul>
     *      <li><code>index</code> - parameter index in array</li>
     *      <li><code>param</code> - current parameter value</li>
     *      <li><code>taskCallback</code> - callback for task finsh</li>
     *      </ul>
     * @param {function} callback - Callback is executed when either execution is finished or
     *      encountered error and <code>stopOnError</code> is set to <code>true</code>.
     *      Callback receives results array with result for each task.
     *      Every error will be wrapped into <code>Exception</code>.
     */
    static arrayExecutor(paramArray, stopOnError, task, callback) {
        assert.equal(Array.isArray(paramArray), true, "argument 'paramArray' must be instance of Array");
        assert.equal(typeof stopOnError, "boolean", "argument 'stopOnError' must be boolean");
        assert.equal(typeof task, "function", "argument 'task' must be function");
        assert.equal(typeof callback, "function", "argument 'callback' must be function");
        const result = [];
        // If param array is empty - return immediately.
        if (paramArray.length <= 0) {
            return callback(null, result);
        }
        let i = 0;
        const taskCallback = function(err, res) {
            if (err) {
                result.push(new Exception("Task " + i + " failed", err));
                if (stopOnError) {
                    return callback(null, result);
                }
            } else {
                result.push(res);
            }
            if (paramArray.length > ++i) {
                process.nextTick(task, i, paramArray[i], taskCallback);
            } else {
                return callback(null, result);
            }
        };
        process.nextTick(task, i, paramArray[i], taskCallback);
    }

    /**
     * Retrieves value from provided object via specified path.
     * If <code>obj</code> is <code>null</code> or <code>undefined</code> - returns <code>null</code>.
     * If provided path does not exists - returns <code>null</code>.
     *
     * @param {*} obj - Starting object
     * @param {string} path - Path to value
     * @return {*|null} Value found in path or <code>null</code> if path could not be traversed.
     */
    static getPathValue(obj, path) {
        if (!obj) {
            return null;
        }
        assert.equal(typeof path, "string", "argument 'path' must be string");
        path = path.split(".");
        for (let i = 0, l = path.length - 1; i < l; i++) {
            if (obj[path[i]] === undefined || obj[path[i]] === null) {
                return null;
            }
            obj = obj[path[i]];
        }
        // We traversed through path to the end - return value
        return obj[path[path.length - 1]];
    }

}

module.exports = Util;