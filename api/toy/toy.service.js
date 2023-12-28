import fs from 'fs'
import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save,
    queryAll
}

// const items = utilService.readJsonFile('data/toy.json')


async function query(filterBy = { txt: '', maxPrice }) {
    try {
        const criteria = {
            name: { $regex: filterBy.txt, $options: 'i' },
            maxPrice: { $lte: filterBy.maxPrice }
        }
        var collection = await dbService.getCollection('toy')
        var toys = await collection.find(criteria).toArray()

        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}




// function query(filterBy = { txt: '' }) {
//     const regex = new RegExp(filterBy.txt, 'i')
//     var itemsToReturn = items.filter(item => regex.test(item.name))
//     if (filterBy.maxPrice) {
//         itemsToReturn = itemsToReturn.filter(item => item.price <= filterBy.maxPrice)
//     }
//     return Promise.resolve(itemsToReturn)
// }




function queryAll() {
    return Promise.resolve(items)
}


function getById(id) {
    const item = items.find(item => item._id === id)
    return Promise.resolve(item)
}

function remove(id) {
    const idx = items.findIndex(item => item._id === id)
    if (idx === -1) return Promise.reject('No Such item')
    const item = items[idx]

    // if (!loggedinUser.isAdmin &&
    //     item.owner._id !== loggedinUser._id) {
    //     return Promise.reject('Not your item')
    // }
    items.splice(idx, 1)
    return _saveItemsToFile()
}

function save(item, loggedinUser) {
    if (item._id) {
        const itemToUpdate = items.find(currItem => currItem._id === item._id)
        // if (!loggedinUser.isAdmin &&
        //     itemToUpdate.owner._id !== loggedinUser._id) {
        // return Promise.reject('Not your item')
        // }

        itemToUpdate.name = item.name
        itemToUpdate.price = item.price
        itemToUpdate.labels = item.labels
        itemToUpdate.inStock = item.inStock
        item = itemToUpdate
    } else {
        item._id = utilService.makeId()
        item.owner = {
            fullname: loggedinUser.fullname,
            score: loggedinUser.score,
            _id: loggedinUser._id,
            isAdmin: loggedinUser.isAdmin
        }
        items.push(item)
    }

    return _saveItemsToFile().then(() => item)
}


function _saveItemsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(items, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to items file', err)
                return reject(err)
            }
            resolve()
        })
    })
}