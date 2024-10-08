const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

module.exports = (client) => {
    async function connectDB() {
        let activeDatabase = null;

        if (config.database.mongodb.enabled && config.database.mongodb.uri) {
            if (activeDatabase) {
                clientLogger.error('Multiple database configurations detected. Only one database should be enabled');
                return process.exit(1);
            }
            activeDatabase = 'mongodb';
            try {
                await mongoose.connect(config.database.mongodb.uri);
                clientLogger.success('Your MongoDB is now successfully connected!');
            } catch (error) {
                clientLogger.error(`MongoDB connection error: ${error.message}`);
                return process.exit(1);
            }
        }

        if (config.database.mysql.enabled && config.database.mysql.config.host) {
            if (activeDatabase) {
                clientLogger.error('Multiple database configurations detected. Only one database should be enabled');
                return process.exit(1);
            }
            activeDatabase = 'mysql';
            try {
                const connection = await mysql.createConnection({
                    host: config.database.mysql.config.host,
                    user: config.database.mysql.config.user,
                    password: config.database.mysql.config.password,
                    database: config.database.mysql.config.database,
                });
                clientLogger.success('Your MySQL is now successfully connected!');
            } catch (error) {
                clientLogger.error(`MySQL connection error: ${error.message}`);
                return process.exit(1);
            }
        }

        if (config.database.postgresql.enabled && config.database.postgresql.config.host) {
            if (activeDatabase) {
                clientLogger.error('Multiple database configurations detected. Only one database should be enabled');
                return process.exit(1);
            }
            activeDatabase = 'postgresql';
            try {
                const client = new Client({
                    host: config.database.postgresql.config.host,
                    user: config.database.postgresql.config.user,
                    password: config.database.postgresql.config.password,
                    database: config.database.postgresql.config.database,
                });
                await client.connect();
                clientLogger.success('Your PostgreSQL is now successfully connected!');
            } catch (error) {
                clientLogger.error(`PostgreSQL connection error: ${error.message}`);
                return process.exit(1);
            }
        }

        if (config.database.sqlite.enabled && config.database.sqlite.config.path) {
            if (activeDatabase) {
                clientLogger.error('Multiple database configurations detected. Only one database should be enabled');
                return process.exit(1);
            }
            activeDatabase = 'sqlite';
            try {
                const db = new sqlite3.Database(config.database.sqlite.config.path, (err) => {
                    if (err) {
                        clientLogger.error(`SQLite connection error: ${err.message}`);
                        return process.exit(1);
                    } else {
                        clientLogger.success('Your SQLite database is now successfully connected!');
                    }
                });
            } catch (error) {
                clientLogger.error(`SQLite connection error: ${error.message}`);
                return process.exit(1);
            }
        }

        if (!activeDatabase) {
            clientLogger.error('No database configuration is enabled. Please enable exactly one database');
            return process.exit(1);
        }
    }
    connectDB();
};
