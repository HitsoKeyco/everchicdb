const catchError = require('../utils/catchError');
const Admin = require('../models/Admin');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const getAll = catchError(async(req, res) => {
    const results = await Admin.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const { firstName, lastName, email, password } = req.body
    const hashPassword = await bcrypt.hash(password, 10)
    const body = { firstName, lastName, email, password: hashPassword}
    const result = await Admin.create(body);
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Admin.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Admin.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    delete req.body.email
    delete req.body.password

    const result = await Admin.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const login = catchError(async (req, res) => {
    const { email, password } = req.body
    const admin = await Admin.findOne({where: { email }})
    if(!admin) return res.sendStatus(401)
    const isValid = await bcrypt.compare(password, admin.password)
    if(!isValid) return res.sendStatus(401)

    const token = jwt.sign(
        { admin },
        process.env.TOKEN_SECRET,
        {expiresIn: '1d'}
    )

    return res.json( { admin, token } )
})



module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login
}