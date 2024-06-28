
const { app } = require('./app');
const { initializeWhatsAppClient } = require('./serverWhatsapp');

const sequelize = require('./utils/connection');

require("./models")

const PORT = process.env.PORT;

const main = async () => {
    try {
        sequelize.sync();
        console.log("DB connected");
        app.listen(PORT);
        console.log(`Server running on port ${PORT}`);        
        await initializeWhatsAppClient()
    } catch (error) {
        console.log(error)
    }
}

main();
