const { readdirSync, statSync } = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    let loadedEventCount = 0;

    const loadEvents = (dir) => {
        const items = readdirSync(dir);

        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = statSync(itemPath); 

            if (stat.isDirectory()) {
                loadEvents(itemPath);
            } else if (item.endsWith('.js')) {
                try {
                    const eventModule = require(itemPath);

                    if (!eventModule || !eventModule.name || typeof eventModule.run !== 'function') {
                        clientLogger.error(`Invalid event module in ${itemPath}. Ensure it exports an object with a 'name' property and a 'run' method`);
                        continue;
                    }

                    const eventName = eventModule.name;
                    const isOnce = eventModule.once || false;

                    const eventHandler = async (...args) => {
                        try {
                            await eventModule.run(...args, client);
                        } catch (error) {
                            clientLogger.error(`Error executing the event ${eventName}: ${error.message}`);
                        }
                    };

                    if (isOnce) {
                        client.once(eventName, eventHandler);
                    } else {
                        client.on(eventName, eventHandler);
                    }

                    loadedEventCount++;
                } catch (error) {
                    clientLogger.error(`Failed to load event ${itemPath}: ${error.message}`);
                }
            }
        }
    };

    try {
        loadEvents(eventsPath);
        clientLogger.success(`Loaded ${loadedEventCount} event(s)`);
    } catch (error) {
        clientLogger.error(`Failed to read events directory: ${error.message}`);
    }
};