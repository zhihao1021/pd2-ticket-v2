import {
    ReactElement,
    useCallback,
    useContext,
    useMemo
} from "react";

import "./browserTextPreview.scss";
import functionContext from "context/function";

type propsType = Readonly<{
    context?: string
}>;

export default function TicketBrowserTextPreview(props: propsType): ReactElement {
    const { context } = props;

    const { addMessage } = useContext(functionContext)

    const copyContent = useCallback(() => {
        if (context === undefined) return;
        navigator.clipboard.writeText(context).then(() => addMessage({
            level: "INFO",
            context: "複製成功。\nCopy success.",
            timestamp: Date.now()
        })).catch(() => addMessage({
            level: "ERROR",
            context: "複製失敗。\nCopy failed.",
            timestamp: Date.now()
        }));
    }, [context, addMessage]);

    const splitContext = useMemo(() => {
        return context?.split("\n") ?? [];
    }, [context]);

    return <div className="textPreview" data-show={context !== undefined}>
        <button className="ms copy" onClick={copyContent}>content_copy</button>
        <pre>
            <code className="lineN">{splitContext.map((_, i) => <div key={i}>{i + 1}</div>)}</code>
            <code className="context">
                {context}
            </code>
        </pre>
    </div>
};
