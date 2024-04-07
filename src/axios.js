import axios from "axios";
import bridge from "@vkontakte/vk-bridge";

const instance = axios.create({
    baseURL: "https://ochem.ru/api",
});

bridge
    .send("VKWebAppStorageGet", {
        keys: ["token"],
    })
    .then((data) => {
        if (data.keys) {
            instance.interceptors.request.use(
                (config) => {
                    config.headers.Authorization = data.keys.token;
                    return config;
                },
                (error) => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        }
    })
    .catch((error) => {
        // Ошибка
        console.log(error);
    });

export default instance;