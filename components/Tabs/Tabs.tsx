import './tabs.css'

export const Tabs = ({ tabs, selectedTabId, onTabClick }) => {
    return (
        <div style={{  display: "flex", width: "100%", alignItems: "stretch"}}>
            {tabs.map(({id, name}) => (
                <div onClick={() => onTabClick(id)} className={`tab-item ${id === selectedTabId && 'tab-selected'}`}>{name}</div>
            ))}
        </div>
    )
}
