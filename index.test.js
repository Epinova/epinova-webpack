const config = require('./index')

test('development', () => {
    expect(config('development', { mode: 'development' })).toMatchSnapshot()
})

test('production', () => {
    expect(config('production', { mode: 'production' })).toMatchSnapshot()
})
