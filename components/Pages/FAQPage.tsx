import styles from '../../styles.module.css'

export const FAQPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8}}>
            Расширение позволяет автоматизировать процесс:
            <ul className={`${styles.markers} ${styles.listTypeLightning}`}>
                <li>фарма монет</li>
                <li>выполнения ежедневных заданий</li>
                <li>забирания ежедневных комбо и ключей в мини-играх</li>
                <li>реинвестирования пассивного дохода</li>
            </ul>
            Для работы необходимо:
            <ul className={`${styles.markers} ${styles.listTypeMark}`}>
                <li>включить расширение</li>
                <li>открыть веб-версию телеграмма</li>
                <li>запустить Hamster Kombat</li>
            </ul>
            <div>
                Все выполненные действия в рамках сессии можно отследить на вкладке <a>Логи</a>
            </div>
            <div>
                В случае возникновения каких либо ошибок - перезагрузить расширение и перезагрузить страницу
            </div>
        </div>
    )
}
