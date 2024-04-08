export default interface UserData {
    id: string,
    username: string,
    global_name?: string,
    avatar?: string,
    is_admin: boolean,
    display_name: string,
    display_avatar: string,
    exp: number,
    iat: number,
};
