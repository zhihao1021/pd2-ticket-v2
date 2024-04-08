import axios from "axios";
import UserData from "schemas/userData";

export async function getUser(userId: string): Promise<UserData> {
    const response = await axios.get(`/user/${userId}`);
    return response.data;
}
