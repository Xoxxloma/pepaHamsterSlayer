import './slider.css'

export const Slider = ({ value, onChange, label, stepSize }) => {

    const onChangeHandler = (e) => {
        onChange(e.target.value)
    }

    return (
        <div className="range">
            <div className="range-slider">
                <label className="label" htmlFor="range">{label}</label><br/>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    id="range"
                    step={stepSize}
                    onChange={onChangeHandler}
                />
                {/*<div className="sliderticks">*/}
                {/*    {steps.map((step) => <span>{step}</span>)}*/}
                {/*</div>*/}
            </div>
            <div className="value">{value}</div>
        </div>

    )
}
