import axios from "axios";

const res = await axios.get("https://google.com");

console.log(res.status);