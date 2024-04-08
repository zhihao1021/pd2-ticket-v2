import {
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import TicketData from "schemas/ticket";

import { updateTicket } from "api/ticket";

import functionContext from "context/function";

import SelectColumn from "components/selectColumn";

import "./editBox.scss";

export default function EditBox(props: Readonly<{
    show: boolean,
    userId: string,
    selectTicket?: TicketData,
    close: () => void,
    callback?: (data: TicketData) => void,
}>): ReactElement {
    const {
        show,
        userId,
        selectTicket,
        close,
        callback
    } = props;

    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [remark, setRemark] = useState<string>("");

    const {
        addMessage,
        setLoading
    } = useContext(functionContext);

    const updateFunc = useCallback(() => {
        if (selectTicket === undefined) return;
        setLoading(true);

        updateTicket(
            userId,
            selectTicket?.id,
            isPublic,
            remark,
        ).then(newData => {
            addMessage({
                context: "更新成功。\nUpdate success.",
                level: "INFO",
                timestamp: Date.now(),
            });
            if (callback) {
                callback(newData);
            }
        }).catch(() => {
            addMessage({
                context: "更新失敗。\nUpdate failed.",
                level: "ERROR",
                timestamp: Date.now(),
            });
        }).finally(() => {
            setLoading(false);
            close();
        })
    }, [addMessage, setLoading, userId, selectTicket, close, callback, isPublic, remark]);

    useEffect(() => {
        if (selectTicket === undefined) return;
        setIsPublic(selectTicket.is_public);
        setRemark(selectTicket.remark);
    }, [selectTicket]);

    return <div className="editBox floatBox" data-show={show} onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains("editBox")) {
            close();
        }
    }}>
        <div className="box">
            <h3>Edit</h3>
            <div className="column">
                <div className="key">Permission</div>
                <SelectColumn
                    options={["Public", "Private"]}
                    select={isPublic ? 0 : 1}
                    next={() => setIsPublic(false)}
                    last={() => setIsPublic(true)}
                />
            </div>
            <div className="column">
                <div className="key">Remark</div>
                <input
                    value={remark}
                    onChange={event => setRemark(event.target.value)}
                />
            </div>
            <div className="buttonBar">
                <button className="confirm" onClick={() => { updateFunc(); }}>Update</button>
                <button className="cancel" onClick={() => { close(); }}>Cancel</button>
            </div>
        </div>
    </div>
};
