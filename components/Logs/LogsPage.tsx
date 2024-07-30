

const LogsPage = ({ logs }) => {
    return (
        <div>
            {logs.map((log) => (
                <div>{log.body}</div>
            ))}
        </div>
    )
}
