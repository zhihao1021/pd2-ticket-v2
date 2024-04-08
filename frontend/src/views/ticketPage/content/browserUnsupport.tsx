import {
    ReactElement,
    useCallback,
    useContext
} from "react";

import "./browserUnsupport.scss";
import { saveAs } from "file-saver";
import functionContext from "context/function";

type propsType = Readonly<{
    file?: File
}>;

export default function TicketBrowserUnsupport(props: propsType): ReactElement {
    const { file } = props;

    const { addMessage } = useContext(functionContext)

    const downloadFile = useCallback(() => {
        if (file === undefined) return;
        try {
            saveAs(file, file.name);
            addMessage({
                level: "INFO",
                context: "下載成功。\nDownload success.",
                timestamp: Date.now()
            });
        }
        catch {
            addMessage({
                level: "ERROR",
                context: "下載失敗。\nDownload failed.",
                timestamp: Date.now()
            });
        }
    }, [file, addMessage]);

    return <div className="unsupport" data-show={file !== undefined}>
        <div>此檔案不支援預覽。</div>
        <div>Can't preview this file.</div>
        <button onClick={downloadFile}>
            <span className="ms">download</span>
            <span>Download</span>
        </button>
    </div>
};
