import type {
    PlasmoCSConfig,
    PlasmoCSUIJSXContainer,
    PlasmoCSUIProps,
    PlasmoRender
} from "plasmo"
import type { FC } from "react"
import { createRoot } from "react-dom/client"
import {Logo} from "~components/logo/Logo";
import {useStorage} from "~node_modules/@plasmohq/storage/dist/hook";
import {STORAGE_KEYS} from "~consts";
import {EProcessState} from "~Models";
import Typewriter, {TypewriterClass} from 'typewriter-effect';
import {useEffect, useRef, useState} from "react";
import './content.css'
import {randomIntFromInterval} from "~utils";

export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/*"]
}

export const getRootContainer = () =>
    new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const rootContainerParent = document.body
            if (rootContainerParent) {
                clearInterval(checkInterval)
                const rootContainer = document.createElement("div")
                rootContainerParent.appendChild(rootContainer)
                resolve(rootContainer)
            }
        }, 1000)
    })

const PlasmoOverlay: FC<PlasmoCSUIProps> = () => {
    const [farmStatus] = useStorage(STORAGE_KEYS.FARM_STATUS, 'IDLE')
    const [showIcon, setShowIcon] = useState(false)
    const typeWriterRef = useRef<TypewriterClass>(null)
    const targetNode = document.getElementById("portals");
    const config = { attributes: true, childList: true, subtree: true };

    const callback = (mutationList) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                const added = [...mutation.addedNodes].filter((node) => node?.innerText?.includes('Hamster Kombat'))
                setShowIcon(Boolean(added.length))
            } else if (mutation.type === "attributes") {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
    };

    const textsMap = {
        [EProcessState.BUSY]: 'RUNNING   SCRIPT   RUNNING  SCRIPT',
        [EProcessState.PROCESSING]: 'FARMING    COINS    FARMING    COINS',
        [EProcessState.IDLE]:  'READY  TO  START   READY  TO  START',
        [EProcessState.FAILURE]: 'SOME  PROBLEMS  SOME  PROBLEMS'
    }
    const phrases = ['Фармим монеты, фармим монеты, фармим монеты', 'Хомяк повержен, попячся упчк упчк', 'Зарабатываем на вторую виллу в Лобне', 'Продам курсы успешного маркетинга, гараж и камаз щебня']

    const typeHandler = () => {
        console.log('CLICKED')
        const idx = randomIntFromInterval(0, phrases.length - 1)
        typeWriterRef.current.deleteAll().typeString(phrases[idx]).start()
    }

    useEffect(() => {
        const observer = new MutationObserver(callback)
        observer.observe(targetNode, config)

        return () => observer.disconnect()
    }, [])

    if (!showIcon) return null

    return (
        <div
            style={{
                borderRadius: 4,
                padding: 4,
                position: "absolute",
                top: 20,
                right: 20,
                display: 'flex',
                flexDirection: "column",
                color: 'white',
                zIndex: 9999,
                width: 250
            }}>
            <Logo onClick={typeHandler} text={textsMap[farmStatus]} />
            <div style={{ color: "black", fontSize: 20, width: '100%' }}>
                <Typewriter
                    options={{ wrapperClassName: "typeWriterContainer", cursorClassName: 'typeWriterCursor'}}
                    onInit={(typewriter) => {
                        typeWriterRef.current = typewriter
                    }}
                />
            </div>
        </div>
    )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
                                                                       createRootContainer
                                                                   }) => {
    const rootContainer = await createRootContainer()
    const root = createRoot(rootContainer)
    root.render(<PlasmoOverlay />)
}

export default PlasmoOverlay
