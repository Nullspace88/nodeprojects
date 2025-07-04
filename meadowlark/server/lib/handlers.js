
const db = require('../db2')

exports.getVacationsApi = async (req, res) => {
    const vacations = await db.getVacations({ available: true })
    res.json(vacations)
}

exports.getVacationBySkuApi = async (req, res) => {
    const vacation = await db.getVacationBySku(req.params.sku)
    res.json(vacation)
}

exports.addVacationInSeasonListenerApi = async (req, res) => {
    await db.addVacationInSeasonListener(req.body.email, req.params.sku)
    res.json({ message: 'success' })
}

exports.requestDeleteVacationApi = async (req, res) => {
    const { email, notes } = req.body
    await db.requestDeleteVacation(req.body.email, req.params.sku)
    res.json({ message: 'success' })
}
