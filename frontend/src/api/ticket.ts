import axios from "axios";

import TicketData from "schemas/ticket";

export async function getTicketList(
    userId: string,
    page?: number,
): Promise<Array<TicketData>> {
    let url = `/ticket/${userId}`;
    if (page !== undefined) {
        url += `?offset=${10 * page}&length=10`;
    }
    const response = await axios.get(url);

    return response.data as Array<TicketData>;
}

export async function createTicket(
    files: Array<File>,
    isPublic: boolean,
    remark: string,
): Promise<TicketData> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file === null) continue
        formData.append("files", new File([file], file.webkitRelativePath || file.name, {
            type: file.type,
        }));
    }
    formData.set("data", JSON.stringify({
        "is_public": isPublic ? "true" : "false",
        "remark": remark
    }));

    const response = await axios.post(
        "/ticket",
        formData
    )

    return response.data;
}

export async function getTicket(
    userId: string,
    ticketId: string,
): Promise<TicketData> {
    const response = await axios.get(
        `/ticket/${userId}/${ticketId}`,
    );

    return response.data as TicketData;
}

export async function updateTicket(
    userId: string,
    ticketId: string,
    isPublic?: boolean,
    remark?: string,
): Promise<TicketData> {
    let data: { [key: string]: any } = {};
    if (isPublic !== undefined) {
        data["is_public"] = isPublic;
    }
    if (remark !== undefined) {
        data["remark"] = remark;
    }
    const response = await axios.put(
        `/ticket/${userId}/${ticketId}`,
        data,
    );

    return response.data as TicketData;
}

export async function deleteTicket(
    userId: string,
    ticketId: string
): Promise<void> {
    await axios.delete(`/ticket/${userId}/${ticketId}`);
}

export async function getTicketContent(
    userId: string,
    ticketId: string,
    filename: string,
): Promise<string | Blob | File> {
    const response = await axios.get(
        `/ticket/${userId}/${ticketId}/files/${filename}`,
        { responseType: "blob" }
    );
    const data = response.data as Blob;

    if (data.type.startsWith("text/")) {
        const stringResult = await data.text();
        return stringResult;
    }

    if (data.type.startsWith("image/")) {
        return response.data;
    }

    return new File([response.data], filename, { type: data.type });
}

export async function getTicketZip(
    userId: string,
    ticketId: string,
): Promise<Blob> {
    const response = await axios.get(
        `/ticket/${userId}/${ticketId}/download`,
        { responseType: "blob" }
    );
    return response.data;
}
