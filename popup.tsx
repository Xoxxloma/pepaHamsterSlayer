import {useEffect, useState} from "react"
import styles from './styles.module.css'
import {Slider} from "~components/Slider/Slider";
import {Checkbox} from "~components/checkbox/Checkbox";
import {Tabs} from "~components/Tabs/Tabs";
import {FAQPage} from "~components/Pages/FAQPage";
import {SettingsPage} from "~components/Pages/SettingsPage";
import {LogsPage} from "~components/Pages/LogsPage";


const tabIds = ['Settings', 'Logs', 'FAQ'] as const
type TabId = (typeof tabIds)[number]

const initialTabs = tabIds.map((id) => ({ id, name: id }))


function IndexPopup() {
  const [selectedTabId, setSelectedTabId] = useState<TabId>(tabIds[0])

    return (
    <div
      style={{
          display: "flex",
          flexDirection: 'column',
          backgroundColor: '#1c1f24',
          width: 350,
          height: 410
      }}>
      <h2 style={{ color: 'white', alignSelf: "center" }}>
        Pepa Hamster Slayer
      </h2>
      <div
          className={styles.scrollbar}
          style={{
              boxSizing: 'border-box',
              flex: 1,
              borderRadius: "40px 40px 0 0",
              borderTop: "2px solid #f3ba2f",
              boxShadow: "0 -4px 64px #fab82299",
              height:"100%",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
          }}
      >
          <div style={{ position: 'sticky', top: 0, backgroundColor: '#1c1f24'}}>
            <Tabs tabs={initialTabs} selectedTabId={selectedTabId} onTabClick={setSelectedTabId} />
          </div>
          <div style={{ padding: 15, display: 'flex', flex: '1'}}>
              { selectedTabId === 'FAQ' && <FAQPage /> }
              { selectedTabId === 'Settings' && <SettingsPage />}
              { selectedTabId === 'Logs' && <LogsPage />}
          </div>
      </div>
    </div>
  )
}

export default IndexPopup
