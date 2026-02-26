const fs = require('fs');
const path = require('path');

fs.readFile('functions.wasm', (err, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    WebAssembly.instantiate(data).then(obj => {
        const wasmModule = obj.instance;

        const x = 10;
        const y = 5;

        console.log(`\n x = ${x} and y = ${y}:`);
        console.log(`Sum: ${x} + ${y} = ${wasmModule.exports.sum(x, y)}`);
        console.log(`Multiply: ${x} * ${y} = ${wasmModule.exports.mul(x, y)}`);
        console.log(`Subtract: ${x} - ${y} = ${wasmModule.exports.sub(x, y)}`);
    }).catch(err => {
        console.error('Error:', err);
    });
}); 