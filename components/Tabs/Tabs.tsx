import './tabs.css'

export const Tabs = ({ tabs, selectedTabId, onTabClick }) => {
    return (
        <div style={{  display: "flex", width: "100%", alignItems: "stretch"}}>
            {tabs.map(({id, name}) => (
                <div onClick={() => onTabClick(id)} className={`tab-item ${id === selectedTabId && 'tab-selected'}`}>{chrome.i18n.getMessage(name)}</div>
            ))}
        </div>
    )
}
