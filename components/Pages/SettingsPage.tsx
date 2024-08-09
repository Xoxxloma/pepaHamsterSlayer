import {Slider} from "~components/Slider/Slider";
import {Checkbox} from "~components/checkbox/Checkbox";
import {EProcessState, Settings} from "~Models";
import { Tooltip } from 'react-tooltip'
import styles from "~styles.module.css";
import {useEffect, useState} from "react";
import {useStorage} from "~node_modules/@plasmohq/storage/dist/hook";
import {STORAGE_KEYS} from "~consts";
import TooltipLogo from '~assets/tooltip.png'
import {TutorialPage} from "~components/Pages/TutorialPage";
import {Spinner} from "~components/spinner/Spinner";

const initialSettingsState: Settings = {
    tapPercent: "1",
    dailyClaim: true,
    dailyCipher: true,
    dailyCombo: true,
    dailyMiniGame: true,
    reinvestPassiveIncome: true,
    useBoosts: true
}

type FieldName = keyof typeof initialSettingsState

export const SettingsPage = () => {
    const [settingsState, setSettingsState] = useState<Settings>(initialSettingsState)
    const [authToken] = useStorage(STORAGE_KEYS.AUTH_TOKEN, null)
    const [persistentSettings, setPersistedSettings] = useStorage<Settings>(STORAGE_KEYS.SETTINGS)
    const [farmStatus] = useStorage(STORAGE_KEYS.FARM_STATUS, 'IDLE')

    const isFarming = farmStatus === EProcessState.PROCESSING || farmStatus === EProcessState.BUSY

    useEffect(() => {
        if (persistentSettings) {
            setSettingsState(persistentSettings)
        }
    }, [persistentSettings])

    const onEndFarmHandler = async () => {
        await chrome.runtime.sendMessage({ type: 'endScript' })
    }

    const onStartFarmHandler = async () => {
        await setPersistedSettings(settingsState)
        await chrome.runtime.sendMessage({ type: 'startScript' })
    }

    const withFieldName = (fieldName: FieldName) => (val) => {
        setSettingsState((prev) => ({
            ...prev,
            [fieldName]: val
        }))
    }

    const checkboxesMap = {
        useBoosts: { label: chrome.i18n.getMessage("settings_useEnergyBoost_label"), description: chrome.i18n.getMessage("settings_useEnergyBoost_description") },
        dailyClaim: { label: chrome.i18n.getMessage("settings_dailyClaim_label"), description: chrome.i18n.getMessage("settings_dailyClaim_description") },
        dailyCipher: { label: chrome.i18n.getMessage("settings_dailyCipher_label"), description: chrome.i18n.getMessage("settings_dailyCipher_description") },
        dailyCombo: { label: chrome.i18n.getMessage("settings_dailyCombo_label"), description: chrome.i18n.getMessage("settings_dailyCombo_description") },
        dailyMiniGame: { label: chrome.i18n.getMessage("settings_dailyMiniGame_label"), description: chrome.i18n.getMessage("settings_dailyMiniGame_description") },
        reinvestPassiveIncome: { label: chrome.i18n.getMessage("settings_reinvestPassiveIncome_label"), description: chrome.i18n.getMessage("settings_reinvestPassiveIncome_description") },
    }

    if (!authToken) {
        return <TutorialPage />
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column'}}>
            { isFarming ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Spinner />
                    <div style={{ fontSize: 20 }}>FARMING</div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
                        <Slider value={settingsState.tapPercent} onChange={withFieldName('tapPercent')} label={chrome.i18n.getMessage("settings_tapPercent_label")} stepSize={0.1} />
                        <div style={{ width: 20, cursor: "pointer" }} data-tooltip-id="tapPercent"><img src={TooltipLogo} height="100%" width="100%" /></div>
                        <Tooltip id="tapPercent" variant="light" place="top-start">
                            <div style={{ maxWidth: 250}}>{chrome.i18n.getMessage("settings_tapPercent_description")}</div>
                        </Tooltip>
                    </div>
                    {Object.entries(checkboxesMap).map(([key, values]) => (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <Checkbox checked={settingsState[key]} onChange={withFieldName(key)} label={values.label} />
                            <div style={{ width: 20, cursor: "pointer" }} data-tooltip-id={key}><img src={TooltipLogo} height="100%" width="100%" /></div>
                            <Tooltip id={key} variant="light" place="top-start">
                                <div style={{ maxWidth: 250}}>{values.description}</div>
                            </Tooltip>
                        </div>
                    ))}
                </>
            )}
            {farmStatus === EProcessState.IDLE
                    ?   <button className={`${styles.startButton} ${styles.buttonGradient}`} onClick={onStartFarmHandler}>Start</button>
                    : farmStatus === EProcessState.FAILURE
                        ? <button className={`${styles.startButton} ${styles.buttonGradient}`} onClick={onStartFarmHandler}>Something went wrong try again</button>
                        :   <button className={`${styles.startButton} ${styles.buttonGradient}`} onClick={onEndFarmHandler}>End</button>
            }

        </div>
    )
}
