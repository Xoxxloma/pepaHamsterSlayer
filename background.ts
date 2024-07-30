import { Storage } from "@plasmohq/storage"
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://api.hamsterkombatgame.io/clicker/'
})

const main = async () => {

    const storage = new Storage()
    await storage.clear()

    const tokenHandler = async (details) => {
        const token = details.requestHeaders.find((header) => header.name.toLowerCase() === 'authorization')
        if (token) {
            await storage.set("pepa_slayer_AUTH_TOKEN", token.value)
            const writtenToken = await storage.get('pepa_slayer_AUTH_TOKEN')
            axiosInstance.defaults.headers['Authorization'] = writtenToken
        }
    }

    const startScriptHandler = async () => {
        try {
            const settings = await storage.get("pepa_slayer_SETTINGS")
            const writtenToken = await storage.get('pepa_slayer_AUTH_TOKEN')
            if (settings) {
                console.log(writtenToken,' TOKEN')
                const response = await axiosInstance.post('sync', {})
                console.log(response.data)
            }
        } catch (e) {
            console.log(e, 'error in startScriptHandler')
        }

    }

    chrome.webRequest.onBeforeSendHeaders.addListener(
        function(details) {
            console.log(details, 'details')
            tokenHandler(details)
        },
        { urls: ["https://api.hamsterkombatgame.io/*"] },
        ["requestHeaders", "extraHeaders"]
    );

    chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.type === 'startScript') {
            startScriptHandler()
        }
    });

    setInterval(() => console.log(new Date()), 300_000)
}

main()


