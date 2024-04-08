export default interface MessageBox {
    level: "INFO" | "WARNING" | "ERROR",
    context: string,
    timestamp: number,
};
