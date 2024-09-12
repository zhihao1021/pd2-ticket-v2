import {
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import "./confirmTab.scss";
import functionContext from "context/function";
import { useNavigate } from "react-router-dom";
import { createTicket } from "api/ticket";

type propsType = Readonly<{
    files: Array<File>,
    isPublic: boolean,
    remark: string,
    last: () => void,
    state: string,
}>;

type createListenerType = ((event: KeyboardEvent) => void) | undefined;

export default function ConfirmTab(props: propsType): ReactElement {
    const {
        files,
        isPublic,
        remark,
        last,
        state,
    } = props;

    const [createListener, setCreateListener] = useState<createListenerType>(undefined);

    const {
        addMessage,
        setLoading,
    } = useContext(functionContext);

    const setNavigate = useNavigate();

    const create = useCallback(() => {
        setLoading(true);
        createTicket(files, isPublic, remark).then(data => {
            addMessage({
                level: "INFO",
                context: "上傳成功。\nUpload success.",
                timestamp: Date.now()
            });
            setNavigate(`/ticket/@me/${data.id}`);
        }).catch(() => {
            addMessage({
                level: "ERROR",
                context: "上傳失敗。\nUpload failed.",
                timestamp: Date.now()
            });
        }).finally(() => {
            setLoading(false);
        });
    }, [files, isPublic, remark, setNavigate, addMessage, setLoading]);

    useEffect(() => {
        setCreateListener((originCreate: createListenerType) => {
            if (originCreate !== undefined) {
                document.removeEventListener("keydown", originCreate);
            }

            return (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    create()
                }
            };
        })
    }, [create, state]);

    useEffect(() => {
        if (state !== "DISPLAY") {
            return;
        }

        if (createListener !== undefined) {
            document.addEventListener("keydown", createListener);
        }
    }, [createListener]);

    return <div id="confirmTab" className="section" data-state={state}>
        <div className="fileCount">
            <div>{`共計 ${files.length} 個檔案`}</div>
            <div>{`There are ${files.length} files in total.`}</div>
        </div>
        <div className="column">
            <div className="key">
                <div>權限</div>
                <div>Permission</div>
            </div>
            <div className="value">{isPublic ? "Public" : "Private"}</div>
        </div>
        <div className="column">
            <div className="key">
                <div>註解</div>
                <div>Remark</div>
            </div>
            <div className="value">{remark || "None"}</div>
        </div>
        <div className="buttonBar">
            <button
                className="last"
                onClick={last}
            >Back</button>
            <button
                className="send next"
                onClick={create}
            >Create</button>
        </div>
    </div>;
};
