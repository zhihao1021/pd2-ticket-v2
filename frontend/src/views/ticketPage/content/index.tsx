import {
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import TicketData from "schemas/ticket";

import {
    getTicket,
    getTicketContent,
    getTicketZip
} from "api/ticket";

import functionContext from "context/function";

import TicketBrowserLoading from './browserLoading';
import TicketBrowserUnsupport from './browserUnsupport';

import "./index.scss";
import TicketBrowserTextPreview from "./browserTextPreview";
import TicketBrowserImgPreview from "./browserImgPreview";
import { saveAs } from "file-saver";

export default function TicketContentPage(): ReactElement {
    const [ticketData, setTicketData] = useState<TicketData | undefined>(undefined);
    const [displayFilename, setDisplayFilename] = useState<string>("");
    const [displayFile, setDisplayFile] = useState<string | Blob | File | undefined>(undefined);

    const {
        setLoading,
        addMessage,
    } = useContext(functionContext);

    const {
        userId,
        ticketId,
        part,
    } = useParams();
    const setNavigate = useNavigate();
    const routeLocation = useLocation();

    const homepath = useMemo(() => {
        return `/ticket/${userId}/${ticketId}`;
    }, [userId, ticketId]);

    const filename = useMemo(() => {
        const regex = new RegExp(`/ticket/${userId}/${ticketId}/file/?`);
        if (routeLocation.pathname.match(regex) === null) return null;

        const result = routeLocation.pathname.replace(regex, "");
        return result;
    }, [userId, ticketId, routeLocation.pathname]);

    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(
            window.location.href.replace("@me", ticketData?.author?.display_data.id ?? "")
        ).then(() => addMessage({
            level: "INFO",
            context: "連結複製成功。\nCopy link success.",
            timestamp: Date.now()
        })).catch(() => addMessage({
            level: "ERROR",
            context: "連結複製失敗。\nCopy link failed.",
            timestamp: Date.now()
        }));
    }, [ticketData, addMessage]);

    const downloadZip = useCallback(() => {
        if (userId === undefined || ticketId === undefined) return;
        setLoading(true);
        getTicketZip(userId, ticketId).then(data => {
            try {
                saveAs(data, `${ticketData?.remark || ticketId || "download"}.zip`);
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
        }).catch(() => {
            addMessage({
                level: "ERROR",
                context: "下載失敗。\nDownload failed.",
                timestamp: Date.now()
            });
        }).finally(() => {
            setLoading(false);
        })
    }, [userId, ticketId, ticketData, addMessage, setLoading]);

    useEffect(() => {
        if (filename === null || filename.length === 0) return;
        setDisplayFile(undefined);
        setDisplayFilename(filename);
        if (userId !== undefined && ticketId !== undefined) {
            getTicketContent(userId, ticketId, filename).then(data => {
                setDisplayFile(data);
            }).catch(() => {
                addMessage({
                    level: "ERROR",
                    context: "檔案內容取得失敗。\nGet file content failed.",
                    timestamp: Date.now()
                });
            });
        }
    }, [filename, addMessage, userId, ticketId]);

    useEffect(() => {
        if (part !== "file" && part !== undefined) {
            setNavigate(`/ticket/${userId}/${ticketId}`);
            return;
        }

        if (userId === undefined || ticketId === undefined) return;
        if (ticketData?.id === ticketId) return;
        setLoading(true);

        getTicket(userId, ticketId).then(data => {
            setTicketData(data);
        }).catch(() => {
            addMessage({
                level: "ERROR",
                context: "Ticket取得失敗。\nGet ticket failed.",
                timestamp: Date.now()
            });
            setNavigate(-1);
        }).finally(() => {
            setLoading(false);
        })
    }, [setLoading, addMessage, setNavigate, userId, ticketId, part, ticketData]);

    return <div id="ticketContent" className="section" >
        <h2>Ticket Content</h2>
        <div className="tabList">
            <button className="info tab" data-select={filename === null} onClick={() => setNavigate(homepath)}>
                <span className="ms">info</span>
                <span>Info</span>
            </button>
            <button className="files tab" data-select={filename !== null} onClick={() => setNavigate(`${homepath}/file`)}>
                <span className="ms">list</span>
                <span>Files</span>
            </button>
            <button
                className="share"
                onClick={copyLink}
            >
                <span className="ms">share</span>
                <span>Share</span>
            </button>
        </div>
        <div className="content" data-tab={filename === null ? 0 : 1}>
            <div className="info">
                <div className="buttonBar">
                    <button className="download" onClick={downloadZip}>
                        <span className="ms">download</span>
                        <span>Download</span>
                    </button>
                </div>
                <div className="column">
                    <div className="row">
                        <div className="key">Ticket ID</div>
                        <div className="value">{ticketData?.id}</div>
                    </div>
                    <div className="row">
                        <div className="key">Author</div>
                        <div className="value">
                            <img alt="avatar" className="avatar" src={ticketData?.author?.display_data.display_avatar} />
                            <Link
                                className="name"
                                to={`/ticket/${ticketData?.author?.display_data.id}`}
                            >{ticketData?.author?.display_data.display_name}</Link>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="row">
                        <div className="key">Permission</div>
                        <div className="value">{ticketData?.is_public ? "Public" : "Private"}</div>
                    </div>
                    <div className="row">
                        <div className="key">Create Time</div>
                        <div className="value">{(new Date(ticketData?.create_time ?? 0)).toLocaleString()}</div>
                    </div>
                </div>
                <div className="column remark">
                    <div className="key">Remark</div>
                    <div className="value">{ticketData?.remark || "None"}</div>
                </div>
            </div>
            <div className="mask">
                <div className="files" data-file={(filename ?? "").length !== 0}>
                    <div className="titleBar">
                        <div className="box">
                            <h3>Files List</h3>
                        </div>
                        <div className="box">
                            <h3>{decodeURI(displayFilename)}</h3>
                        </div>
                    </div>
                    <div className="browser">
                        <div className="box list">
                            {ticketData?.files.map((v, i) => <div key={i} className="container">
                                <Link to={encodeURI(v)} >{v}</Link>
                            </div>)}
                        </div>
                        <div className="box container">
                            <TicketBrowserLoading show={displayFile === undefined} />
                            <TicketBrowserUnsupport file={displayFile instanceof File ? displayFile : undefined} />
                            <TicketBrowserTextPreview context={typeof displayFile === "string" ? displayFile : undefined} />
                            <TicketBrowserImgPreview img={displayFile instanceof Blob && !(displayFile instanceof File) ? displayFile : undefined} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
};
