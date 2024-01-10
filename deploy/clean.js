const fs = require('fs');

let folders = [
    'dist',
    'build',
];

function clean() {
    folders.forEach(folder => {
        if (fs.existsSync(folder)) {
            fs.rmdirSync(folder, { recursive: true });
        }
    });
}

clean();