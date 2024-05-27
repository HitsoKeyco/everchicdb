const User = require("../../models/User")

const userCreate = async () => {

    const user = {
        firstName: "Sergio",
        lastName: "Riatiga",
        email: "sergio@gmail.com",
        password: "sergio1234",
        phone: "+4312"
    }

    await User.create(user)

}

module.exports = userCreate