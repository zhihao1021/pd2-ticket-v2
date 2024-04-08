import {
    CSSProperties,
    ReactElement
} from "react";

import "./browserLoading.scss";

type propsType = Readonly<{
    show: boolean
}>;

export default function TicketBrowserLoading(props: propsType): ReactElement {
    const { show } = props;

    return <div className="loading" data-show={show}>
        <div className="container">
            <span className="ms">public</span>
            {Array.from(Array(4)).map((_, i) => <span key={i} style={{ "--delay": i } as CSSProperties} className="ms ico" />)}
            <span className="ms">folder_open</span>
        </div>
    </div>;
};
