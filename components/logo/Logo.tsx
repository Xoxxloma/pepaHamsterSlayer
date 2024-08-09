import loading from './loading.gif'
import './logo.css'

export const Logo = ({ onClick, text }) => {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', zIndex: 666, cursor: 'pointer'}} onClick={onClick}>
            <div style={{ position: 'relative'}}>
                <div className="motto">
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            style={{ fill: "transparent"}}
                            id="circlePath"
                            d="
                          M 10, 50
                          a 40,40 0 1,1 80,0
                          40,40 0 1,1 -80,0
                        "
                        />
                        <text style={{ fontSize: 14, whiteSpace: "break-spaces" }}>
                            <textPath href="#circlePath">
                                {/*IT   SOLUTIONS   BASED   ON   MEMES*/}
                                {text}
                            </textPath>
                        </text>
                    </svg>
                </div>
                <img className='image logo' src={loading} />
            </div>
        </div>
    )
}
