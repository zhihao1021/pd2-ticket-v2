import {
    ReactElement,
    useCallback,
    useContext,
} from "react";

import TicketData from "schemas/ticket";

import { deleteTicket } from "api/ticket";

import functionContext from "context/function";

import "./confirmBox.scss";

export default function ConfirmBox(props: Readonly<{
    show: boolean,
    userId: string,
    selectTicket?: TicketData,
    close: () => void,
    callback?: () => void,
}>): ReactElement {
    const {
        show,
        userId,
        selectTicket,
        close,
        callback
    } = props;

    const {
        addMessage,
        setLoading
    } = useContext(functionContext);

    const deleteFunc = useCallback(() => {
        if (selectTicket === undefined) return;
        setLoading(true);
        deleteTicket(userId, selectTicket.id).then(() => {
            addMessage({
                context: "刪除成功。\nRemove success.",
                level: "INFO",
                timestamp: Date.now(),
            });
            if (callback) {
                callback();
            }
        }).catch(() => {
            addMessage({
                context: "刪除失敗。\nRemove failed.",
                level: "ERROR",
                timestamp: Date.now(),
            });
        }).finally(() => {
            setLoading(false);
            close();
        });
    }, [addMessage, setLoading, userId, selectTicket, close, callback]);

    return <div className="confirmBox floatBox" data-show={show} onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains("confirmBox")) {
            close();
        }
    }}>
        <div className="box">
            <h3>Confirm</h3>
            <div>你確定要刪除這個Ticket嗎?</div>
            <div>Are you sure want to delete this ticket?</div>
            <div className="buttonBar">
                <button className="confirm" onClick={() => { deleteFunc(); }}>Confirm</button>
                <button className="cancel" onClick={() => { close(); }}>Cancel</button>
            </div>
        </div>
    </div>
};
