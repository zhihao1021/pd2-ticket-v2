import {
    ReactElement,
    useEffect,
    useState
} from "react";

import "./index.scss";

type propsType = Readonly<{
    show: boolean
}>;

export default function LoadingPage(props: propsType): ReactElement {
    const { show } = props;

    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        setTimeout(() => {
            setCount(v => (v + 1) % 3);
        }, 1000)
    }, [count]);

    return <div id="loadingPage" data-show={show}>
        <h4>{"Loading" + " .".repeat(count + 1)}</h4>
    </div>;
};
