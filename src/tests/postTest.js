const sequelize = require('../utils/connection');
require('../models')

const postTest = async () => {

    try {
        await sequelize.sync({ force: true })
        console.log('DB reset ✅');
        process.exit()
    } catch (error) {
        console.error(error);
    }
}

postTest()