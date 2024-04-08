import {
    ReactElement,
    SyntheticEvent,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import TicketData from "schemas/ticket";
import UserData from "schemas/userData";

import { getTicketList } from "api/ticket";

import functionContext from "context/function";
import userDataContext from "context/userData";

import ConfirmBox from "./confirmBox";
import EditBox from "./editBox";

import "./index.scss";
import "./floatBox.scss";
import { getUser } from "api/user";

export default function TicketListPage(): ReactElement {
    const [ticketList, setTicketList] = useState<Array<TicketData>>([]);
    const [nextPage, setNextPage] = useState<number>(0);
    const [showConfirmBox, setConfirmBox] = useState<boolean>(false);
    const [showEditBox, setEditBox] = useState<boolean>(false);
    const [selectTicket, setSelectTicket] = useState<TicketData | undefined>(undefined);
    const [authorData, setAuthorData] = useState<UserData | undefined>(undefined);

    const boxElement = useRef<HTMLDivElement>(null);

    const {
        userId
    } = useParams();

    const userData = useContext(userDataContext);
    const {
        setLoading,
        addMessage,
    } = useContext(functionContext);

    const setNavigate = useNavigate();

    // Load next 10 result
    const loadNext = useCallback((targetPage: number) => {
        if (userId === undefined) return;
        if (targetPage === -1) return;
        getTicketList(userId, targetPage).then(data => {
            setTicketList(v => [...v, ...data]);

            if (data.length < 10) {
                setNextPage(-1);
            }
            else {
                setNextPage(targetPage + 1);
                const element = boxElement.current;
                if (element === null) return;
                if (Math.abs(element.scrollTop + element.clientHeight - element.scrollHeight) < 1) {
                    loadNext(targetPage + 1);
                }
            }

        }).catch(() => {
            addMessage({
                context: "Ticket清單取得失敗。\nGet ticket list failed.",
                level: "ERROR",
                timestamp: Date.now()
            });
        });
    }, [userId, addMessage]);

    // Load next 10 result when scroll to bottom
    const autoLoad = useCallback((event: SyntheticEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        if (Math.abs(element.scrollTop + element.clientHeight - element.scrollHeight) < 1) {
            loadNext(nextPage);
        }
    }, [loadNext, nextPage]);

    useEffect(() => {
        if (userId && userId !== "@me") {
            getUser(userId).then(
                data => setAuthorData(data)
            ).catch(() => setAuthorData(undefined));
        }
    }, [userId]);

    // Load first 10 result
    useEffect(() => {
        if (userId === undefined) return;
        setLoading(true);
        getTicketList(userId).then(data => {
            setTicketList(data);
            setNextPage(data.length < 10 ? -1 : 1);
            loadNext(1);
        }).catch(() => {
            addMessage({
                context: "Ticket清單取得失敗。\nGet ticket list failed.",
                level: "ERROR",
                timestamp: Date.now()
            });
            setNavigate("../");
        }).finally(() => {
            setLoading(false)
        });
    }, [addMessage, setLoading, setNavigate, loadNext, userId]);

    return <div id="ticketList" className="section">
        <h2>
            {userId !== "@me" && authorData ?
                <span>Ticket List - </span> : <span>Ticket List</span>}
            {
                userId !== "@me" && authorData ? <div
                    className="authorInfo"
                >
                    <img alt="avatar" src={authorData?.display_avatar} />
                    <div className="userName">{authorData?.display_name}</div>
                </div> : undefined
            }
        </h2>
        <ConfirmBox
            show={showConfirmBox}
            userId={userId ?? ""}
            selectTicket={selectTicket}
            close={() => setConfirmBox(false)}
            callback={() => setTicketList(v => v.filter(d => d.id !== selectTicket?.id))}
        />
        <EditBox
            show={showEditBox}
            userId={userId ?? ""}
            selectTicket={selectTicket}
            close={() => setEditBox(false)}
            callback={newData => setTicketList(v => {
                let nv = Array.from(v);
                const index = nv.findIndex(v => v.id === newData.id);
                nv[index] = newData;
                return nv;
            })}
        />
        <div ref={boxElement} className="box" onScroll={autoLoad}>
            {ticketList.length === 0 ? <div className="empty">
                <div>該使用者沒有上傳任何 Ticket。</div>
                <div>This user doesn't upload any ticket yet.</div>
            </div> : ticketList.map(data => <DataBox
                key={data.id}
                data={data}
                editFunc={() => { setSelectTicket(data); setEditBox(true) }}
                deleteFunc={() => { setSelectTicket(data); setConfirmBox(true); }}
                enable={userId === "@me" || userId === userData?.id}
            />)}
        </div>
    </div>;
};

function DataBox(props: Readonly<{
    data: TicketData,
    enable: boolean,
    deleteFunc: () => void,
    editFunc: () => void,
}>): ReactElement {
    const {
        data,
        enable,
        deleteFunc,
        editFunc,
    } = props;

    return <div className="dataBox">
        <div className="snapshot">
            <Link to={`${data.id}`} className="id mono">{data.id.slice(0, 6)}</Link>
            <Link to={`${data.id}`} className="remark">{data.remark}</Link>
            <label>
                <span className="ms">expand_more</span>
                <input type="checkbox" />
            </label>
        </div>
        <div className="detail">
            <div className="column">
                <div className="key">Create Time</div>
                <div className="value">{(new Date(data.create_time)).toLocaleString()}</div>
            </div>
            <div className="column">
                <div className="key">Permission</div>
                <div className="value">{data.is_public ? "Public" : "Private"}</div>
            </div>
            <div className="buttonBar">
                <button
                    className="edit"
                    onClick={enable ? editFunc : undefined}
                    disabled={!enable}
                >Edit</button>
                <button
                    className="delete"
                    onClick={enable ? deleteFunc : undefined}
                    disabled={!enable}
                >Delete</button>
            </div>
        </div>
    </div>;
}
