/*  iterator.js
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

function createIterator(items) {
    let i = 0;
    return {
        next: function () {
            let done = (i >= items.length);
            let value = (done ? undefined : items[i++]);
            return {
                done: done,
                value: value
            }
        }
    }
}

exports.createIterator = createIterator;