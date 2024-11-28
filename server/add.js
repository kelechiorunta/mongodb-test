debugger

let n = 0;

const add = (...args) => {
    for (let value of args){
        n += value;
    }
    return n
}

console.log(add(5,3,4));

export { add }