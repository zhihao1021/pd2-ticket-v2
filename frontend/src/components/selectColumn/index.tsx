import { CSSProperties, ReactElement } from "react";

import "./index.scss";

type propsType = Readonly<{
    options: Array<string>
    select: number,
    last: () => void,
    next: () => void,
}>;

export default function SelectColumn(props: propsType): ReactElement {
    const {
        options,
        select,
        last,
        next,
    } = props;

    return <div className="selectColumn">
        <button
            className="ms"
            onClick={select <= 0 ? undefined : last}
            disabled={select <= 0}
        >navigate_before</button>
        <div
            className="content"
            style={{
                "--width": Math.max(...options.map(v => v.length))
            } as CSSProperties}
        >
            {options.map((v, i) => <div
                key={i}
                className="option mono"
                data-select={i === select ? "SELECT" : i < select ? "LAST" : "NEXT"}
            >{v}</div>)}
        </div>
        <button
            className="ms"
            onClick={select >= options.length - 1 ? undefined : next}
            disabled={select >= options.length - 1}
        >navigate_next</button>
    </div>
}