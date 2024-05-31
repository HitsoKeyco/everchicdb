
const { app } = require('./app');
const serverChat = require('./serverChat');
const sequelize = require('./utils/connection');

require("./models")

const PORT = process.env.PORT || 8080;

const main = async () => {
    try {
        sequelize.sync();
        console.log("DB connected");
        app.listen(PORT);
        console.log(`Server running on port ${PORT}`);

        const PORT_CHAT = process.env.PORT_CHAT || 3001;
        // serverChat(app, PORT_CHAT);
        
        
    } catch (error) {
        console.log(error)
    }
}

main();
