import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import {
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Navigate,
    Route,
    Routes,
    useLocation, useNavigate
} from "react-router-dom";

import JWT from "schemas/jwt";
import MessageBox from "schemas/messageBox";
import UserData from "schemas/userData";

import functionContext from "context/function";
import userDataContext from "context/userData";

import LoginPage from "views/loginPage";
import LoadingPage from "views/loadingPage";
import SideBar from "views/sideBar";
import MessageQueue from "views/messageQueue";
import TicketPage from "views/ticketPage";
import UploadPage from "views/uploadPage";

import { setDealError } from "config/axios";

import "./App.scss";

export default function App(): ReactElement {
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [messageQueue, setMessageQueue] = useState<Array<MessageBox>>([]);
    const [lastPath, setLastPath] = useState<string>("");
    const [checkOauth, setCheckOauth] = useState<boolean>(false);

    const location = useLocation();
    const setNavigate = useNavigate();

    // Get user data
    const token = localStorage.getItem("access_token");
    const userData = useMemo(() => {
        if (token === null) return undefined;
        try {
            return jwtDecode(token) as UserData;
        }
        catch {
            return undefined;
        }
    }, [token]);

    const addMessage = useCallback((messageBox: MessageBox) => {
        messageBox.timestamp += Math.random();
        setMessageQueue(v => [...v, messageBox]);
        setTimeout(() => {
            setMessageQueue(v => v.slice(1));
        }, 6200);
    }, []);

    useEffect(() => {
        setDealError((error) => {
            if (error.response === undefined) {
                addMessage({
                    level: "ERROR",
                    context: "無法連接至伺服器，請稍後再試。\nServer down, please try later.",
                    timestamp: Date.now(),
                });
            }
            throw error;
        });
    }, [addMessage]);

    // Record last access path
    useEffect(() => {
        if (lastPath !== "") return;
        if (location.pathname !== "/login") {
            localStorage.setItem("lastPath", location.pathname);
        }
        setLastPath(localStorage.getItem("lastPath") || "/ticket");
    }, [location.pathname, lastPath]);

    // Check whether token efficient
    useEffect(() => {
        if (checkOauth) return;
        if (window.localStorage.getItem("access_token") !== null) {
            axios.put("/oauth").then((response) => {
                const data: JWT = response.data;
                window.localStorage.setItem("access_token", data.access_token);
                window.localStorage.setItem("token_type", data.token_type);
            }).catch((error: AxiosError) => {
                const status = error.response?.status;
                if (status === 403 || status === 401) {
                    window.localStorage.removeItem("access_token");
                    window.localStorage.removeItem("token_type");
                    setNavigate("/login")
                }
            }).finally(() => {
                setCheckOauth(true);
            });
        }
    }, [setNavigate, checkOauth]);

    return <userDataContext.Provider value={userData}>
        <functionContext.Provider value={{
            setLoading: setLoadingState,
            addMessage: addMessage,
        }}>
            <div id="app">
                <LoadingPage show={loadingState} />
                <MessageQueue messageQueue={messageQueue} />
                {userData === undefined ? undefined : <SideBar />}
                {
                    userData === undefined ? <Routes>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes> : <Routes>
                        <Route path="ticket/*" element={<TicketPage />} />
                        <Route path="upload/*" element={<UploadPage />} />
                        <Route path="last" element={<Navigate to={lastPath} />} />
                        <Route path="*" element={<Navigate to="/ticket" />} />
                    </Routes>
                }
            </div>
        </functionContext.Provider>
    </userDataContext.Provider>;
};
