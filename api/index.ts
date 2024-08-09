import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: 'https://api.hamsterkombatgame.io/clicker/',
});


export const getUserInfo = async () => {
    const { data } = await axiosInstance.post("sync")
    return data.clickerUser
}

export const tap = async (count) => {
    const timestamp = (new Date()).getTime()
    const body = {
        availableTaps: 0,
        count,
        timestamp
    }
    const { data } = await axiosInstance.post('tap', body)
    return data.clickerUser
}

export const getUpgrades = async () => {
    const { data } = await axiosInstance.post('upgrades-for-buy')
    return data
}

export const buyUpgrade = async (upgradeId) => {
    const timestamp = (new Date()).getTime()
    const { data } = await axiosInstance.post('buy-upgrade', { timestamp, upgradeId })
    return data
}

export const getDailyComboCards = async () => {
    const { data } = await axios.post('https://api21.datavibe.top/api/GetCombo')
    return data
}

export const claimDailyCombo = async () => {
    const { data } = await axiosInstance.post('claim-daily-combo', {})
    return data
}

export const getDailyCipher = async (cipher) => {
    const { data } = await axiosInstance.post('claim-daily-cipher', { cipher: cipher})
    return data
}

export const getConfig = async () => {
    const { data } = await axiosInstance.post('config')
    return data
}

export const getTasks = async () => {
    const { data } = await axiosInstance.post('list-tasks')
    return data.tasks
}

export const completeDailyTask = async () => {
    const { data } = await axiosInstance.post('check-task', {'taskId': 'streak_days'})
    return data
}

export const startMiniGame = async () => {
    const { data } = await axiosInstance.post('start-keys-minigame')
    return data
}

export const claimMiniGame = async (cipher) => {
    const { data } = await axiosInstance.post('claim-daily-keys-minigame', { cipher })
    return data
}

export const applyPromoCode = async (promoCode) => {
    const { data } = await axiosInstance.post('apply-promo', { promoCode })
    return data

    //response is { clickerUser: ordinary user state, promoState: { promoId:"43e35910-c168-4634-ad4f-52fd764a843f", receiveKeysRefreshSec:18368, receiveKeysToday:1} }
}

export const getBoosts = async () => {
    const { data } = await axiosInstance.post('boosts-for-buy')
    return data.boostsForBuy
}

export const buyBoost = async (boostId) => {
    const timestamp = (new Date()).getTime()
    const { data } = await axiosInstance.post('buy-boost', { timestamp, boostId })
    return data.clickerUser
}
