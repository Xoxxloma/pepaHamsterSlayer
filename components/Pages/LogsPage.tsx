import {useStorage} from "~node_modules/@plasmohq/storage/dist/hook";
import {STORAGE_KEYS, TIME_FORMAT} from "~consts";
import dayjs from "dayjs";

export const LogsPage = () => {
    const [actionsLog, setActionLog] = useStorage(STORAGE_KEYS.ACTIONS_LOG, {})
    const entries = Object.entries(actionsLog).reverse()

    return (
        <div style={{ display: 'flex', flex: '1', flexDirection: 'column', overflow: 'auto', gap: 6}}>
            {entries.length ? entries.map(([date, message]) => (
                <>
                    <div>
                        <div>{message}</div>
                        <div style={{ fontSize: 10, color: 'lightgray'}}>Timestamp: {dayjs(date).format(TIME_FORMAT)}</div>
                    </div>
                    <div style={{ width: '100%', height: 1, backgroundColor: '#f3ba2f'}} />
                </>
                ))
                : <div style={{ display: 'flex', fontSize: 20, justifyContent: 'center', flex: '1', alignItems: 'center'}}>{chrome.i18n.getMessage("empty_logs")}</div>}
        </div>
    )
}
