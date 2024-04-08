import axios from "axios";
import {
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import "./index.scss";
import userDataContext from "context/userData";

export default function SideBar(): ReactElement {
    const ref = useRef<HTMLInputElement>(null);

    const [coreVersion, setCoreVersion] = useState<string>("Loading...");
    const [pingEnd, setPingEnd] = useState<number>(Date.now());
    const [pingDelta, setPingDelta] = useState<number>(-1);

    const userData = useContext(userDataContext);

    const location = useLocation();
    const setNavigate = useNavigate();

    const autoClose = useCallback(() => {
        if (ref.current) ref.current.checked = false;
    }, [ref]);

    useEffect(() => {
        setTimeout(() => {
            let start = Date.now();
            axios.get("/ping").then(() => {
                setPingEnd(Date.now())
                setPingDelta(Date.now() - start);
            }).catch(() => {
                setPingDelta(-2)
            });
        }, 3000);
    }, [pingEnd]);

    useEffect(() => {
        let start = Date.now();
        axios.get("/version").then(response => {
            setCoreVersion(response.data);
            setPingDelta(Date.now() - start);
        }).catch(() => {
            setCoreVersion("API Down");
        });
    }, []);

    useEffect(() => {
        document.querySelector("body")?.addEventListener("click", event => {
            const target = event.target as HTMLElement;
            if (!document.querySelector("#sideBar")?.contains(target) && target.id !== "sideBar") {
                autoClose();
            }
        })
    }, [autoClose]);

    return <div id="sideBar">
        <label>
            <input ref={ref} type="checkbox" />
        </label>
        <div className="mask">
            <div className="content">
                <div className="title">
                    <img alt="avatar" src={userData?.display_avatar} />
                    <div className="box">
                        <div className="welcome">Welcome</div>
                        <div className="name">{userData?.display_name}</div>
                    </div>
                </div>
                <div
                    className="option"
                    data-select={location.pathname.startsWith("/ticket")}
                    onClick={() => { setNavigate("/ticket"); autoClose(); }}
                >
                    <div className="text">Ticket 列表</div>
                    <div className="text">Ticket List</div>
                </div>
                <div
                    className="option"
                    data-select={location.pathname.startsWith("/upload")}
                    onClick={() => { setNavigate("/upload"); autoClose(); }}
                >
                    <div className="text">上傳 Ticket</div>
                    <div className="text">Upload Ticket</div>
                </div>
                <div className="logout">
                    <button onClick={() => {
                        localStorage.clear();
                        autoClose();
                        setNavigate("/login");
                    }}>
                        <span className="ms">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
                <div className="version">
                    <div>
                        <div className="key">UI Version</div>
                        <div className="value">{process.env.REACT_APP_UI_VERSION}</div>
                    </div>
                    <div>
                        <div className="key">Core Version</div>
                        <div className="value">{coreVersion}</div>
                    </div>
                    <div>
                        <div className="key">Delay</div>
                        <div className="value">{
                            pingDelta === -1 ? "Loading..." :
                                pingDelta === -2 ? "API Down" :
                                    `${pingDelta} ms`}</div>
                    </div>
                    <div>
                        <a href="https://github.com/zhihao1021/pd2-ticket-v2" target="_blank" rel="noreferrer">
                            <span>Github</span>
                            <span className="ms">open_in_new</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
};
