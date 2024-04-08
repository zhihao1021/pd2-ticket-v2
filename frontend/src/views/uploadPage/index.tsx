import {
    ReactElement,
    useCallback,
    useEffect,
    useState
} from "react";

import UploadTab from "./uploadTab";
import ConfigTab from "./configTab";
import ConfirmTab from "./confirmTab";

import "./index.scss";

export default function UploadPage(): ReactElement {
    const [selectFiles, setSelectFiles] = useState<Array<File>>([]);
    const [displayPage, setDisplayPage] = useState<number>(0);
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [remark, setRemark] = useState<string>("");

    const reset = useCallback(() => {
        setSelectFiles([]);
        setDisplayPage(0);
        setIsPublic(false);
        setRemark("");
    }, []);

    useEffect(() => () => {
        reset();
    }, [reset]);

    return <div id="uploadPage" className="page">
        <h2>Create Ticket</h2>
        <div className="titleBox">
            <h3 data-state={displayPage > 0 ? "LAST" : "DISPLAY"}>Select Files</h3>
            <h3 data-state={displayPage > 1 ? "LAST" : displayPage < 1 ? "NEXT" : "DISPLAY"}>Config</h3>
            <h3 data-state={displayPage < 2 ? "NEXT" : "DISPLAY"}>Confirm</h3>
        </div>
        <div className="box">
            <UploadTab
                selectFiles={selectFiles}
                setSelectFiles={setSelectFiles}
                next={() => setDisplayPage(1)}
                state={displayPage > 0 ? "LAST" : "DISPLAY"}
            />
            <ConfigTab
                isPublic={isPublic}
                remark={remark}
                setIsPublic={setIsPublic}
                setRemark={setRemark}
                last={() => setDisplayPage(0)}
                next={() => setDisplayPage(2)}
                state={displayPage > 1 ? "LAST" : displayPage < 1 ? "NEXT" : "DISPLAY"}
            />
            <ConfirmTab
                files={Array.from(selectFiles)}
                isPublic={isPublic}
                remark={remark}
                last={() => setDisplayPage(1)}
                state={displayPage < 2 ? "NEXT" : "DISPLAY"}
            />
        </div>
    </div>;
};