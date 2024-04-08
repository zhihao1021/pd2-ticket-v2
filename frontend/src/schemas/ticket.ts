import UserData from "./userData"

export default interface TicketData {
    id: string,
    files: Array<string>,
    is_public: boolean,
    remark: string,
    create_time: number,
    author?: {
        display_data: UserData
    }
};
