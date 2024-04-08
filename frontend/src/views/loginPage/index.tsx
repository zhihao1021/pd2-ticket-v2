import {
    ReactElement, useContext, useEffect
} from "react";
import {
    useSearchParams
} from "react-router-dom";

import { oauth } from "api/oauth";

import functionContext from "context/function";

import "./index.scss";

export default function LoginPage(): ReactElement {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        setLoading,
        addMessage,
    } = useContext(functionContext);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code === null) return;

        searchParams.delete("code");
        setSearchParams(searchParams);

        setLoading(true);
        oauth(code).then((value) => {
            localStorage.setItem("access_token", value.access_token);
            localStorage.setItem("token_type", value.token_type);
        }).catch(() => {
            addMessage({
                level: "ERROR",
                context: "登入失敗。\nLogin failed.",
                timestamp: Date.now(),
            });
        }).finally(() => {
            setLoading(false);
        });
    }, [setLoading, addMessage, searchParams, setSearchParams]);

    return <div id="loginPage" className="page">
        <div className="box">
            <h1>Login</h1>
            <a href={process.env.REACT_APP_OAUTH_URL} draggable={false}>
                <img
                    alt="login button"
                    src={`${process.env.PUBLIC_URL}/img/discord-logo-white.svg`}
                    draggable={false}
                />
            </a>
        </div>
    </div>;
};
