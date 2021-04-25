/*  picShow.js
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

let execSync = require("child_process").execSync;
let logger = require("./logger");

function testTycat() {
    try {
        execSync("tycat 2> /dev/null");
    } catch (error) {
        return false;
    }
    return true;
}

function show(pic, size) {
    try {
        execSync("tycat -g 8192x" + size + ' ' + pic);
    } catch (error) {
        logger.error(error);
    }
}

exports.testTycat = testTycat;
exports.show = show;