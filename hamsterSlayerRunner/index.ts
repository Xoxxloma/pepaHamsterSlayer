import {
    buyBoost,
    buyUpgrade,
    claimDailyCombo, claimMiniGame, completeDailyTask,
    getBoosts, getConfig, getDailyCipher,
    getDailyComboCards, getTasks,
    getUpgrades,
    getUserInfo, startMiniGame,
    tap
} from "~api";
import {
    delay,
    getAvailableDailyComboCardIdsToBuy,
    randomInterval,
    randomIntFromInterval,
    reinvestPassiveIncome, setNewLogEvent
} from "~utils";
import {storage} from "~background";
import {STORAGE_KEYS, TIME_FORMAT} from "~consts";
import {EProcessState, Settings} from "~Models";
import dayjs from "dayjs";



export const runner = (settings: Settings) => {
    const nestedIter = async () => {
        // TODO везде ниже используется устаревшие данные пользователя, без учета новых монет после тапа

        await storage.set(STORAGE_KEYS.FARM_STATUS, EProcessState.BUSY)
        const user = await getUserInfo()
        const boosts = await getBoosts()
        const energyBoost = boosts.find((boost) => boost.id === 'BoostFullAvailableTaps')
        const isEnergyBoostAvailable = energyBoost.cooldownSeconds === 0 && energyBoost.level <= energyBoost.maxLevel
        if (user.availableTaps > 0) {
            const farmRate = Number(settings.tapPercent)
            const tapCount = Math.round(user.availableTaps * farmRate)
            const userAfterTap = await tap(tapCount)
            console.log(user.availableTaps, 'available taps')
            console.log(tapCount, 'tapCount')
            console.log('TAPPED! ', tapCount, ' TIMES')
            console.log('BALANCE: ', userAfterTap.balanceCoins)
            await setNewLogEvent(`Tapped ${tapCount} times with percent ${settings.tapPercent} from settings. Current balance: ${userAfterTap.balanceCoins}`)

        }

        // ИСПОЛЬЗУЕМ ЭНЕРДЖИ БУСТ ЕСЛИ ЕСТЬ
        if (settings.useBoosts && isEnergyBoostAvailable) {
            console.log('waiting before apply energy boost')
            await delay(5000)
            const userAfterBoost = await buyBoost(energyBoost.id)
            console.log('succesfully bought energy boost')
            console.log('wait more before tap again')
            await delay(5000)
            const farmRate = Number(settings.tapPercent)
            const tapCount = Math.round(userAfterBoost.availableTaps * farmRate)
            const userAfterSecondTap = await tap(tapCount)
            console.log('TAPPED! ', tapCount, ' TIMES')
            console.log('BALANCE: ', userAfterSecondTap.balanceCoins)
            await setNewLogEvent(`Succesfully bought energy boost and tapped ${tapCount} times with percent ${settings.tapPercent} from settings. Current balance: ${userAfterSecondTap.balanceCoins}`)
        }

        const upgrades = await getUpgrades()

        // СОСТАВЛЯЕТСЯ ДЕЙЛИ КОМБО
        if (settings.dailyCombo && upgrades?.dailyCombo?.isClaimed === false) {
            const dailyCombo = await getDailyComboCards()
            const cardIds = getAvailableDailyComboCardIdsToBuy(user.balanceCoins, dailyCombo, upgrades)
            if (cardIds) {
                console.log(cardIds, 'acessible to buy combo!')
                await cardIds.reduce(async (acc, upgradeId) => {
                    try {
                        await acc
                        await buyUpgrade(upgradeId)
                        console.log('succesfully buy upgrade with id: ', upgradeId)
                        await delay(2000)
                    } catch (e) {
                        console.log('error while buying upgrade ', e,  upgradeId)
                    }
                }, Promise.resolve())
                console.log('waiting before claim combo')
                await delay(3000)
                await claimDailyCombo()
                console.log("WE'VE BOUGHT DAILY COMBO!")
                await setNewLogEvent(`Successfully claimed daily combo!Bought cards with ids ${cardIds.join(", ")}`)
            }
        }

        const { dailyCipher, dailyKeysMiniGame } = await getConfig()
        // ЗАБИРАЕТСЯ ДЕЙЛИ ШИФР
        if (settings.dailyCipher && dailyCipher?.isClaimed === false) {
            const cipher = dailyCipher.cipher
            const constructed = cipher.slice(0, 3) + cipher.slice(4)
            const cypher = atob(constructed)
            const result = await getDailyCipher(cypher)
            await setNewLogEvent('Claimed daily cipher!')
        }

        // ЗАБИРАЕТСЯ МИНИ ИГРА
        if (settings.dailyMiniGame && dailyKeysMiniGame?.isClaimed === false && dailyKeysMiniGame.remainSecondsToNextAttempt <= 0) {
            const firstPart = randomIntFromInterval(11, 99)
            const secondPart = randomIntFromInterval(1000000, 9999999)
            const cipher = `0${firstPart}${secondPart}|${user.id}`
            const base64cipher = btoa(cipher)
            await startMiniGame()
            console.log(cipher, 'generated daily cipher')
            await delay(6666)
            await claimMiniGame(base64cipher)
            console.log('succesfully claimed mini game')
            await setNewLogEvent('Claimed daily mini game!')
        }

        // ВЫПОЛНЯЕТСЯ ЕЖЕДНЕВНОЕ ЗАДАНИЕ
        const tasks = await getTasks()
        const dailyTask = tasks[tasks.length - 1]
        if (settings.dailyClaim && !dailyTask.isCompleted) {
            await completeDailyTask()
            const reward = dailyTask.rewardCoins
            console.log('successfully complete daily task, and get ', reward)
            await setNewLogEvent(`successfully complete daily task, and get ${reward}`)
        }

        const userToCalculateSleepTime = await getUserInfo()
        const sleepTimeSeconds = (Math.floor((userToCalculateSleepTime.maxTaps - userToCalculateSleepTime.availableTaps) / user.tapsRecoverPerSec) + randomInterval(2, 20))
        const sleepTimeMiliseconds = sleepTimeSeconds * 1000
        const passiveIncomeReinvested = Math.floor(user.earnPassivePerSec * sleepTimeSeconds)

        // считаем сколько монет заработаем за время простоя и реинвестируем их
        if (settings.reinvestPassiveIncome) {
            await reinvestPassiveIncome(Math.min(passiveIncomeReinvested, user.balanceCoins), sleepTimeSeconds, upgrades)
        }
        console.log('sleep time', sleepTimeMiliseconds)
        console.log('next tap time: ', new Date((new Date()).getTime() + sleepTimeMiliseconds))
        await setNewLogEvent(`Waiting for new attempt at ${dayjs().add(sleepTimeMiliseconds, 'milliseconds').format(TIME_FORMAT)}`)
        const timerId = setTimeout(() => nestedIter(), sleepTimeMiliseconds)

        await storage.set(STORAGE_KEYS.FARM_STATUS, EProcessState.PROCESSING)
        await storage.set(STORAGE_KEYS.TIMER_ID, timerId)
    }
    return nestedIter()
}

