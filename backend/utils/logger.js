const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            meta,
            pid: process.pid
        }) + '\n';
    }

    writeToFile(filename, content) {
        const filepath = path.join(this.logDir, filename);
        fs.appendFileSync(filepath, content);
    }

    info(message, meta = {}) {
        const logMessage = this.formatMessage('INFO', message, meta);
        console.log('\x1b[36m[INFO]\x1b[0m', message, meta);
        this.writeToFile('app.log', logMessage);
    }

    error(message, meta = {}) {
        const logMessage = this.formatMessage('ERROR', message, meta);
        console.error('\x1b[31m[ERROR]\x1b[0m', message, meta);
        this.writeToFile('error.log', logMessage);
    }

    warn(message, meta = {}) {
        const logMessage = this.formatMessage('WARN', message, meta);
        console.warn('\x1b[33m[WARN]\x1b[0m', message, meta);
        this.writeToFile('app.log', logMessage);
    }

    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            const logMessage = this.formatMessage('DEBUG', message, meta);
            console.log('\x1b[35m[DEBUG]\x1b[0m', message, meta);
            this.writeToFile('debug.log', logMessage);
        }
    }

    // Stream for morgan HTTP logging
    get stream() {
        return {
            write: (message) => {
                this.info(message.trim(), { source: 'HTTP' });
            }
        };
    }
}

module.exports = new Logger();