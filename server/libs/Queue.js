
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

exports.Queue = Queue;