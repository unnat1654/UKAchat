export const convertTimeTo12=(time)=>{
    const Time = new Date(time);
    const hours = Time.getHours() % 12 ? Time.getHours() % 12 : 12;
    const minutes = Time.getMinutes();
    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes} ${Time.getHours() / 12 < 1 ? "am" : "pm"}`;
}