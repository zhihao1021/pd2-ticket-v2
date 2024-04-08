import {
    createContext
} from "react";

import UserData from "schemas/userData";

const userDataContext = createContext<UserData | undefined>(undefined);

export default userDataContext;
