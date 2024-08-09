import {Storage} from "@plasmohq/storage"
import {axiosInstance} from "~api";
import {runner} from "~hamsterSlayerRunner";
import {STORAGE_KEYS} from "~consts";
import {EProcessState} from "~Models";
import {delay} from "~utils";

export const storage = new Storage()
const main = async () => {

    await storage.clear()

    const checkStatus = async () => {
        const currentStatus = await storage.get(STORAGE_KEYS.FARM_STATUS)
        if (currentStatus === EProcessState.BUSY) {
            await delay(5000)
            return checkStatus()
        } else {
            return true
        }
    }

    const tokenHandler = async (details) => {
        const token = details.requestHeaders.find((header) => header.name.toLowerCase() === 'authorization')
        const writtenToken = await storage.get(STORAGE_KEYS.AUTH_TOKEN)
        if (token && token !== writtenToken) {
            await storage.set(STORAGE_KEYS.AUTH_TOKEN, token.value)
            axiosInstance.defaults.headers['Authorization'] = token.value
        }
    }

    const startScriptHandler = async () => {
        try {
            const settings = await storage.get(STORAGE_KEYS.SETTINGS)
            if (settings) {
                // script here
                await storage.set(STORAGE_KEYS.FARM_STATUS, EProcessState.PROCESSING)
                await storage.set(STORAGE_KEYS.ACTIONS_LOG, {})
                await runner(settings)
            }
        } catch (e) {
            console.log(e, 'error in startScriptHandler')
            await storage.set(STORAGE_KEYS.FARM_STATUS, EProcessState.FAILURE)
        }
    }

    const endScriptHandler = async () => {
        try {
            const timerId = await storage.get(STORAGE_KEYS.TIMER_ID)
            await checkStatus()
            clearTimeout(timerId)
            console.log('in end script')
            await storage.remove(STORAGE_KEYS.TIMER_ID)
            await storage.set(STORAGE_KEYS.FARM_STATUS, EProcessState.IDLE)
        } catch (e) {
            console.log(e, 'error in endScriptHandler')
            await storage.set(STORAGE_KEYS.FARM_STATUS, EProcessState.FAILURE)
        }
    }

    const setCurrentTab = async (tabId) => {
        const currentTab = await chrome.tabs.get(tabId)
        if (currentTab.url.startsWith('https://web.telegram.org')) {
            await storage.set(STORAGE_KEYS.CURRENT_TAB, 'TELEGRAM')
        } else {
            await storage.set(STORAGE_KEYS.CURRENT_TAB, 'REST')
        }
    }

    const getRules = async () => {
        const currentRules = await chrome.declarativeNetRequest.getDynamicRules()
        const newRules = [
            {
                "id": 1489,
                "priority": 1,
                "action": {
                    "type": chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                    "responseHeaders": [
                        { "header": "Content-Security-Policy", "operation": chrome.declarativeNetRequest.HeaderOperation.REMOVE },
                        { "header": "X-Content-Security-Policy", "operation": chrome.declarativeNetRequest.HeaderOperation.REMOVE },
                        { "header": "X-Frame-Options", "operation": chrome.declarativeNetRequest.HeaderOperation.REMOVE},
                        { "header": "CHLEN", value: "PIPISKA", "operation": chrome.declarativeNetRequest.HeaderOperation.SET},
                    ],
                },
                "condition": {
                    "resourceTypes": [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME, chrome.declarativeNetRequest.ResourceType.SUB_FRAME, chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST]
                }
            }
        ]
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: currentRules.map((r) => r.id),
            addRules: newRules
        })
        await  chrome.declarativeNetRequest.getDynamicRules(
            e => console.log(e)
        );
    }

    const replaceSrcHandler = async (tabId) => {
        const currentTab = await chrome.tabs.get(tabId)
        if (currentTab.title === 'Hamster Kombat' && currentTab.url.startsWith("https://web.telegram.org")) {
            await chrome.scripting.executeScript({
                target: {tabId: tabId},
                func: () => {
                    const frame = document.querySelector('iframe')
                    if (frame) {
                        if (frame.src.includes('tgWebAppPlatform=weba')) {
                            setTimeout(() => {
                                const newSrc = frame.src.replaceAll('tgWebAppPlatform=weba', 'tgWebAppPlatform=android');
                                frame.src = newSrc;
                            }, 1000)
                        }
                    }
                }
            })
        }
    }


    chrome.webRequest.onBeforeSendHeaders.addListener(
        function(details) {
            tokenHandler(details)
        },
        { urls: ["https://api.hamsterkombatgame.io/*"] },
        ["requestHeaders", "extraHeaders"]
    );

    // chrome.runtime.onInstalled.addListener((details) => {
    //     getRules()
    // });

    chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.type === 'startScript') {
            startScriptHandler()
        }
        if (request.type === 'endScript') {
            console.log('end script')
            endScriptHandler()
        }

        if (request.type === 'replaceSrc') {
            chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
                replaceSrcHandler(tab.id)
            })
        }
    });

    chrome.tabs.onActivated.addListener((activeInfo => {
        setCurrentTab(activeInfo.tabId)
    }))

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {

        if (changeInfo.status === 'complete') {
            replaceSrcHandler(tabId)
        }
    })
}

main()


