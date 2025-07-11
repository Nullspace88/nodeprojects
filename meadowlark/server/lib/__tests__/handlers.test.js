
const handlers = require('../handlers')
const mainhandlers = require('../handlers/main')
const vacationhandlers = require('../handlers/vacations')

test('home page renders', () => {
    const req = {}
    const res = { render: jest.fn() }
    mainhandlers.home(req, res)
    expect(res.render.mock.calls[0][0]).toBe('home')
})

test('about page renders with fortune', () => {
    const req = {}
    const res = { render: jest.fn() }
    mainhandlers.about(req, res)
    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('about')
    expect(res.render.mock.calls[0][1])
	.toEqual(expect.objectContaining({
	    fortune: expect.stringMatching(/\W/),
	}))
})

test('404 handler renders', () => {
    const req = {}
    const res = { render: jest.fn() }
    mainhandlers.notFound(req, res)
    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('404')
})

test('500 handler renders', () => {
    const err = new Error('some error')
    const req = {}
    const res = { render: jest.fn() }
    const next = jest.fn()
    mainhandlers.serverError(err, req, res, next)
    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('500')
})
