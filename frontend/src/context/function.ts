import {
    createContext
} from "react";
import MessageBox from "schemas/messageBox";

const functionContext = createContext<{
    setLoading: (status: boolean) => void,
    addMessage: (messageBox: MessageBox) => void,
}>({
    setLoading: () => { },
    addMessage: () => { },
});

export default functionContext;
