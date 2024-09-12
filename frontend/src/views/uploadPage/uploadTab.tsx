import {
    ChangeEvent,
    Dispatch,
    ReactElement,
    SetStateAction,
    useCallback,
    useState
} from "react";

import "./uploadTab.scss";

type propsType = Readonly<{
    selectFiles: Array<File>,
    setSelectFiles: Dispatch<SetStateAction<Array<File>>>,
    next: () => void,
    state: string,
}>;

export default function UploadTab(props: propsType): ReactElement {
    const {
        selectFiles,
        setSelectFiles,
        next,
        state
    } = props;

    const [search, setSearch] = useState<string>("");

    const selectFilesFunc = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files === undefined || files === null) return;
        const filesArray = Array.from(files).filter(f => f.name);
        setSelectFiles(v => {
            const filesNameArray = filesArray.map(f => f.name);
            const newValue = v.filter(f => !filesNameArray.includes(f.name));
            return [...newValue, ...filesArray];
        });
    }, [setSelectFiles]);

    const nextCheck = useCallback(() => {
        if (selectFiles.length > 0) {
            next();
        }
    }, [selectFiles, next]);

    return <div id="uploadTab" className="section" data-state={state}>
        <div className="toolBar">
            <span className="ms searchIcon">search</span>
            <input className="search" type="text" placeholder="Search..." onChange={event => setSearch(event.target.value)} />
            <label className="selectFile">
                <input type="file" onChange={selectFilesFunc} multiple />
            </label>
            <label className="selectDirectory">
                <input type="file" onChange={selectFilesFunc} directory="" webkitdirectory="" mozdirectory="" multiple />
            </label>
            <label className="clear">
                <button onClick={search === "" ?
                    () => { setSelectFiles([]); } :
                    () => {
                        setSelectFiles(v => v.filter(f => !f.name.includes(search)));
                        setSearch("");
                    }}>close</button>
            </label>
        </div>
        <div className="list">
            {
                (search === "" ? selectFiles : selectFiles.filter(
                    file => file.name.includes(search)
                )).map(
                    file => <div key={file.webkitRelativePath || file.name}>
                        <span>{file.webkitRelativePath || file.name}</span>
                        <button
                            className="ms"
                            onClick={() => setSelectFiles(v => v.filter(f => f.name !== file.name))}
                        >delete</button>
                    </div>
                )
            }
        </div>
        <div className="buttonBar">
            <button
                disabled={selectFiles.length === 0}
                className="next"
                onClick={nextCheck}
            >Next</button>
        </div>
    </div>
};
