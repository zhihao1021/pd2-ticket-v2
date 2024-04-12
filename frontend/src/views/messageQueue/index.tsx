import {
    ReactElement,
    useEffect
} from "react";

import MessageBox from "schemas/messageBox";

import "./index.scss";

type propsType = Readonly<{
    messageQueue: Array<MessageBox>
}>;

export default function MessageQueue(props: propsType): ReactElement {
    const {
        messageQueue
    } = props;

    return <div id="messageQueue">
        {
            messageQueue.length > 0 ? messageQueue.map(data => <div
                key={`${data.timestamp}${data.context.slice(0, 3)}${data.level}`}
                data-key={`${data.timestamp}${data.context.slice(0, 3)}${data.level}`}
                className="box"
                data-level={data.level}
            >{data.context}</div>) : undefined
        }
    </div>;
};