import {useStorage} from "~node_modules/@plasmohq/storage/dist/hook";
import {STORAGE_KEYS} from "~consts";
import styles from 'styles.module.css'


export const TutorialPage = () => {
    const [currentTab] = useStorage(STORAGE_KEYS.CURRENT_TAB, null)
    const isTelegramTabOpened = currentTab === 'TELEGRAM'

    const onReplaceSrcHandler = () => {
        chrome.runtime.sendMessage({ type: 'replaceSrc' })
    }

    return isTelegramTabOpened
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 16, justifyContent: 'center', flex: '1', alignItems: 'center', textAlign: 'center'}}>
            <div>
                {chrome.i18n.getMessage("token_not_found")}
            </div>
            <div>{chrome.i18n.getMessage("src_not_replaced")}</div>
            <button className={`${styles.startButton} ${styles.buttonGradient}`} onClick={onReplaceSrcHandler}>
                {chrome.i18n.getMessage("connect_to_hamster")}
            </button>
        </div>
        : <div style={{ display: 'flex', fontSize: 20, justifyContent: 'center', flex: '1', alignItems: 'center', textAlign: 'center'}}>{chrome.i18n.getMessage("wrong_tab")}</div>

}
