import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {buyUpgrade} from "~api";
import {storage} from "~background";
import {STORAGE_KEYS, TIME_FORMAT} from "~consts";


dayjs.extend(customParseFormat)

const getAvailableDailyComboCardIdsToBuy = (startBalance, comboCards, upgrades) => {
    const { date, combo } = comboCards
    const upgradeIds = upgrades.dailyCombo.upgradeIds
    const availableUpgrades = upgrades.upgradesForBuy

    const isSameDay = isSameDayCombo(date)

    console.log(isSameDay, 'isSameDay')
    if (!isSameDay) {
        console.log('Daily combo outdated yet!')
        return
    }

    const availableUpgradesToBuy = availableUpgrades.filter((up) => combo.includes(up.id) && !upgradeIds.includes(up.id) && up.isAvailable && !up.isExpired)

    const isComboAvailable = combo.length === (upgradeIds.length + availableUpgradesToBuy.length)

    if (!isComboAvailable) {
        console.log(`Combo is not available, accessible only ${availableUpgradesToBuy.length} of ${combo.length}`)
        console.log(`Accessible cards ${availableUpgradesToBuy.map((up) => up.name).join(", ")}`)
        return
    }
    const sumOfNeedableCards = availableUpgradesToBuy.reduce((acc, card) => acc += card.price, 0)
    if (startBalance < sumOfNeedableCards) {
        const needableDelta = sumOfNeedableCards - startBalance
        console.log(`We dont have enough coins to buy combo, ${needableDelta} coins left`)
        return
    }

    return availableUpgradesToBuy.map((c) => c.id)
}

const reinvestPassiveIncome = async (coinsAmount, sleepTimeSeconds, upgrades) => {
    let currentBalance = coinsAmount
    const lastTimePassiveIncome = await storage.get(STORAGE_KEYS.LAST_TIME_PASSIVE_INCOME)

    if (lastTimePassiveIncome) {
        const sleepTimeInHours = sleepTimeSeconds / 3600
        const hoursDiff = dayjs().diff(dayjs(lastTimePassiveIncome), 'hour', true)
        if (hoursDiff.toFixed(1) <= sleepTimeInHours.toFixed(1)) {
            console.log('NOT TIME YET')
            return
        }
    }
    console.log('ITS TIME TO INVESTMENT')
    const sorted = upgrades.upgradesForBuy.filter((up) => {
        const cooldown = up.cooldownSeconds ?? 0
        const maxlvl = up?.maxLevel ?? up.level
        return up.isAvailable && !up.isExpired && cooldown === 0 && maxlvl <= up.level && up.profitPerHourDelta > 0
    }).sort((a, b) => {
        const significanceA = a.profitPerHourDelta / a.price
        const significanceB = b.profitPerHourDelta / b.price

        return significanceB - significanceA
    })

    const cardsToBuy = sorted.filter((upgrade) => {
        if (currentBalance >= upgrade.price) {
            currentBalance -= upgrade.price
            return true
        }
        return false
    })

    await cardsToBuy.reduce(async(acc, val) => {
        await acc
        console.log('waiting before buy upgrade', val.name)
        await delay(3000)
        await buyUpgrade(val.id)

    }, Promise.resolve())

    await setNewLogEvent(`Reinvest passive income with cards ${cardsToBuy.map((card) => card.name).join(", ")}`)
    await storage.set(STORAGE_KEYS.LAST_TIME_PASSIVE_INCOME, dayjs().toString())
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const delay = (ms) => new Promise((res) => setTimeout(() => res(), ms))

const isSameDayCombo = (date) => {
    const isSameDay = dayjs(date, "DD-MM-YY").isSame(dayjs(), 'day')
    return isSameDay
}

const randomInterval = (from, to) => {
    return Math.floor(Math.random() * to) + from;
}

const setNewLogEvent = async (message) => {
    const log = await storage.get(STORAGE_KEYS.ACTIONS_LOG)
    console.log(log, 'log before writing')
    console.log(message, 'message to write')
    if (log) {
        const dateKey = dayjs().format(TIME_FORMAT)
        const newLog = {...log, [dateKey]: message }
        console.log(newLog, 'newLog before writing')
        await storage.set(STORAGE_KEYS.ACTIONS_LOG, newLog)
        console.log('successfully wrote')
        await delay(2000)
    }
}


export {
    getAvailableDailyComboCardIdsToBuy,
    reinvestPassiveIncome,
    randomIntFromInterval,
    delay,
    randomInterval,
    setNewLogEvent
}
