import axios from "axios";
import JWT from "schemas/jwt";

export async function oauth(code: string): Promise<JWT> {
    const response = await axios.post(
        "/oauth",
        { code: code }
    );
    return response.data as JWT;
}
