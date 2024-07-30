import {useEffect, useState} from "react"
import styles from './styles.module.css'
import {Slider} from "~components/Slider/Slider";
import {Checkbox} from "~components/checkbox/Checkbox";
import {Tabs} from "~components/Tabs/Tabs";
import {FAQPage} from "~components/FAQ/FAQPage";
import {useStorage} from "~node_modules/@plasmohq/storage/dist/hook";


const tabIds = ['Settings', 'Logs', 'FAQ'] as const
type TabId = (typeof tabIds)[number]

const initialTabs = tabIds.map((id) => ({ id, name: id }))

const initialSettingsState = {
    tapPercent: "100",
    dailyClaim: true,
    dailyCipher: true,
    dailyCombo: true,
    dailyMiniGame: true,
    reinvestPassiveIncome: true,
    useBoosts: true
}

type FieldName = keyof typeof initialSettingsState

function IndexPopup() {
  const [selectedTabId, setSelectedTabId] = useState<TabId>(tabIds[0])
  const [settingsState, setSettingsState] = useState(initialSettingsState)
  const [persistentSettings, setPersistedSettings] = useStorage("pepa_slayer_SETTINGS")
  const [authToken, setAuthToken] = useStorage("pepa_slayer_AUTH_TOKEN", null)

    useEffect(() => {
        if (persistentSettings) {
            setSettingsState(JSON.parse(persistentSettings))
        }
    }, [persistentSettings])

    const pupa = async () => {
        await setPersistedSettings(JSON.stringify(settingsState))
        await chrome.runtime.sendMessage({ type: 'startScript' })
    }


    const withFieldName = (fieldName: FieldName) => (val) => {
        setSettingsState((prev) => ({
            ...prev,
            [fieldName]: val
        }))
    }


    return (
    <div
      style={{
          display: "flex",
          flexDirection: 'column',
          backgroundColor: '#1c1f24',
          width: 350,
      }}>
      <h2 style={{ color: 'white', alignSelf: "center" }}>
        Pepa Hamster Slayer
      </h2>

      <div style={{borderRadius: "40px 40px 0 0", borderTop: "2px solid #f3ba2f", boxShadow: "0 -4px 64px #fab82299", padding: 10,}}>
          <Tabs tabs={initialTabs} selectedTabId={selectedTabId} onTabClick={setSelectedTabId} />
          { selectedTabId === 'FAQ' ? <FAQPage /> :
            <>
                <Slider value={settingsState.tapPercent} onChange={withFieldName('tapPercent')} label="Выберите % монет для тапа" stepSize={10} />
                <Checkbox checked={settingsState.dailyClaim} onChange={withFieldName('dailyClaim')} label="Забирать ежедневную награду" />
                <Checkbox checked={settingsState.dailyCipher} onChange={withFieldName('dailyCipher')} label="Забирать ежедневный шифр" />
                <Checkbox checked={settingsState.dailyCombo} onChange={withFieldName('dailyCombo')} label="Забирать ежедневное комбо (При доступности карт)" />
                <Checkbox checked={settingsState.dailyMiniGame} onChange={withFieldName('dailyMiniGame')} label="Выполнять ежедневную мини-игру" />
                <Checkbox checked={settingsState.reinvestPassiveIncome} onChange={withFieldName('reinvestPassiveIncome')} label="Реинвестировать доход в час" />
                <Checkbox checked={settingsState.useBoosts} onChange={withFieldName('useBoosts')} label="Использовать бусты при наличии" />
                <button disabled={!authToken} className={`${styles.startButton} ${styles.buttonGradient}`} onClick={pupa}>Start</button>
            </>
          }
      </div>
    </div>
  )
}

export default IndexPopup
