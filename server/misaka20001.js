/*  misaka20001.js (misakaNet server)
 *
 *  Copyright 2021  Olddoctor Development Team
 *
 *  This file is part of misakaNet
 *
 *  misakaNet is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  misakaNet program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

//定义Queue
function Queue() {
    this.dataStore = [];
    this.enqueue = enqueue;
    this.dequeue = dequeue;
    this.front = front;
    this.back = back;
    this.toString = toString;
    this.empty = empty;
}

//向队末尾添加一个元素
function enqueue(element) {
    this.dataStore.push(element)
}

//删除队首的元素
function dequeue() {
    return this.dataStore.shift();
}

function front() { //读取队首和队末的元素
    return this.dataStore[0];
}
function back() { ////读取队首和队末的元素
    return this.dataStore[this.dataStore.length - 1]
}

//显示队列内的所有元素
function toString() {
    var retStr = "";
    for (var i = 0; i < this.dataStore.length; ++i ) {
        retStr += this.dataStore[i] + "\n";
    }
    return retStr
}

//队列是否为空
function empty() {
    if (this.dataStore.length == 0) {
        return true;
    } else {
        return false;
    }
}

let logger = require("./libs/logger");

//消息列表
let msg = {};

//从本地获取misakaKey
logger.info("reading misakaKeys");
let iterator = require("./libs/iterator")
                .createIterator(require("fs").readFileSync("/etc/misakaNet/misakaKeys.conf")
                .toString().split('\n')[0].split(' '));
let i;
let misakaKeys = {};
while (!(i = iterator.next()).done) {
    let split = i.value.split(',');
    misakaKeys[split[0]] = split[1];
}
logger.info("got misakaKeys");

logger.info("start server");
require("http").createServer(function(req, res) {
    logger.info("new client");
    let misakaKey = req.headers["misaka-key"];
    logger.debug(req.headers);
    let position;
    if ((position = misakaKeys[misakaKey]) == undefined) {
        logger.info("misakakey not found");
        res.writeHead(404, {"Content-Type": "application/json;charset=utf-8"});
        res.write(JSON.stringify({
            OK: false,
            error: {
                code: 1,
                msg: "misakaKey not found"
            }
        }));
        res.end();
    }
    else {
        //判断msg中是否有该sister
        if (msg[position] == undefined)
            msg[position] = new Queue();

        logger.debug(msg);
        switch (req.method) {
            case "POST":
                logging.debug(req.body);
                msg[position].enqueue(req.body);
                res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
                res.write(JSON.stringify({
                    OK: true,
                    msg: "pushed"
                }));
                res.end();
                logger.info("pushed");
                break;
            case "GET":
                res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
                res.write(JSON.stringify({
                    OK: true,
                    msg: "got",
                    body: msg[position].front(),
                    empty: msg[position].empty()
                }));
                msg[position].dequeue();
                res.end();
                logger.info("got");
                break;
            default:
                res.writeHead(404);
                res.end();
                break;
        }
    }
}).listen(20001);