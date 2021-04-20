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

let logger = require("./libs/logger");
let Queue = require("./libs/Queue").Queue;

//消息列表
let msg = new Array();

//从本地获取misakaKey
logger.info("reading misakaKeys");
let iterator = require("./libs/iterator")
                .createIterator(require("fs").readFileSync("/etc/misakaNet/misakaKeys.conf")
                .toString().split(' '));
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
    logger.debug(req.getHeader("misakaKey"));
    let misakaKey = req.getHeaders().misakaKey;
    logger.debug(misakaKey);
    let position;
    if ((position = misakaKeys[misakaKey]) == undefined) {
        logger.info("misakakey not found");
        res.writeHead(404, {"Content-Type": "application/json;charset=utf-8"});
        res.write({
            OK: false,
            error: {
                code: 1,
                msg: "misakaKey not found"
            }
        });
        res.end();
    }
    else{
        //判断msg中是否有该sister
        if (msg[position] == undefined)
            msg[position] = Queue();

        logger.debug(msg);
        switch (req.method) {
            case "POST":
                msg[position].enqueue(req.body);
                res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
                res.write({
                    OK: true,
                    msg: "pushed"
                });
                res.end();
                logger.info("pushed");
                break;
            case "GET":
                res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
                res.write({
                    OK: true,
                    msg: "got",
                    body: msg[position].dequeue(),
                    empty: msg[position].empty()
                });
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