const request = require("supertest")
const app = require("../app")

const URL_BASE = "/api/v1/categories"
const URL_BASE_USERS = "/api/v1/users"
let TOKEN
let categoryId

beforeAll(async () => {
    const user = {
        email: "sergio@gmail.com",
        password: "sergio1234"
    }

    const res = await request(app)
        .post(`${URL_BASE_USERS}/login`)
        .send(user)

    TOKEN = res.body.token

})

test("POST ->'URL_BASE', should return staus code 201 and res.body.name === category.name", async () => { //🔐
    const category = {
        name: "Tecno"
    }

    const res = await request(app)
        .post(URL_BASE)
        .send(category)
        .set("Authorization", `Bearer ${TOKEN}`)

    categoryId = res.body.id

    expect(res.status).toBe(201)
    expect(res.body).toBeDefined()
    expect(res.body.name).toBe(category.name)
})

test("GET ->'URL_BASE', should return staus code 200 and res.body.length === 1", async () => {

    const res = await request(app)
        .get(URL_BASE)

    expect(res.status).toBe(200)
    expect(res.body).toBeDefined()
    expect(res.body).toHaveLength(1)
})


test("DELETE ->'URL_BASE/:id', should return staus code 204", async () => { //🔐

    const res = await request(app)
        .delete(`${URL_BASE}/${categoryId}`)
        .set("Authorization", `Bearer ${TOKEN}`)

    expect(res.status).toBe(204)
})