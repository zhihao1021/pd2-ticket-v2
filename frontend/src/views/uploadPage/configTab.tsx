import {
    Dispatch,
    ReactElement,
    SetStateAction
} from "react";

import SelectColumn from "components/selectColumn";

import "./configTab.scss";

type propsType = Readonly<{
    isPublic: boolean,
    remark: string,
    setIsPublic: Dispatch<SetStateAction<boolean>>,
    setRemark: Dispatch<SetStateAction<string>>,
    last: () => void,
    next: () => void,
    state: string
}>;

export default function ConfigTab(props: propsType): ReactElement {
    const {
        isPublic,
        remark,
        setIsPublic,
        setRemark,
        last,
        next,
        state
    } = props;

    return <div id="configTab" className="section" data-state={state}>
        <div className="column">
            <div className="key">
                <div>權限</div>
                <div>Permission</div>
            </div>
            <SelectColumn
                options={["Private", "Public"]}
                select={isPublic ? 1 : 0}
                next={() => setIsPublic(true)}
                last={() => setIsPublic(false)}
            />
        </div>
        <div className="column">
            <div className="key">
                <div>註解</div>
                <div>Remark</div>
            </div>
            <input value={remark} onChange={event => setRemark(event.target.value ?? "")} />
        </div>
        <div className="buttonBar">
            <button
                className="last"
                onClick={last}
            >Back</button>
            <button
                className="next"
                onClick={next}
            >Next</button>
        </div>
    </div>;
};
