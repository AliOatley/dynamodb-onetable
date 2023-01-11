/*
    debug.ts - Just for debug

    Edit your test case here and invoke via: "jest debug"

    Or run VS Code in the top level directory and just run.
 */
import {AWS, Client, Entity, Match, Model, Table, print, dump, delay} from './utils/init'
import {OneSchema} from '../src/index.js'

jest.setTimeout(7200 * 1000)

//  Change with your schema
const schema = {
    version: '0.0.1',
    indexes: {
        primary: {hash: 'pk', sort: 'sk'},
        gs1: {hash: 'gs1pk', sort: 'gs1sk', project: 'all'},
    },
    models: {
        User: {
            pk: {type: 'string', value: '${_type}#'},
            sk: {type: 'string', value: '${_type}#${id}'},

            gs1pk: {type: 'string', value: '${_type}#'},
            gs1sk: {type: 'string', value: '${_type}#${id}'},

            name: {type: 'string'},
            email: {type: 'string'},
            id: {type: 'string', generate: 'ulid'},
        },
    } as const,
}

//  Change your table params as required
const table = new Table({
    name: 'DebugTable',
    client: Client,
    partial: false,
    schema,
    logger: true,
})

//  This will create a local table
test('Create Table', async () => {
    if (!(await table.exists())) {
        await table.createTable()
        expect(await table.exists()).toBe(true)
    }
})

test('Test1', async () => {
    let log = true
    let User = table.getModel('User')
    await User.create({name: 'John', email: 'john@gmail.com'})
    await User.create({name: 'Tim', email: 'tim@gmail.com'})
    let first = await User.find({}, {limit: 1})
    let second = await User.find({}, {limit: 1, next: first.next})
    let previous = await User.find({}, {limit: 1, prev: second.prev})

    expect(second.prev).toHaveProperty('pk')
    expect(second.prev).toHaveProperty('sk')
})

test('Test2', async () => {
    let log = true
    let User = table.getModel('User')
    await User.create({name: 'Ann', email: 'ann@gmail.com'})
    await User.create({name: 'Bob', email: 'bob@gmail.com'})
    let first = await User.find({}, {limit: 1, index: 'gs1', log})
    let second = await User.find({}, {limit: 1, index: 'gs1', next: first.next, log})
    let previous = await User.find({}, {limit: 1, index: 'gs1', prev: second.prev, log})

    expect(second.prev).toHaveProperty('pk')
    expect(second.prev).toHaveProperty('sk')
})

test('Destroy Table', async () => {
    await table.deleteTable('DeleteTableForever')
    expect(await table.exists()).toBe(false)
})
