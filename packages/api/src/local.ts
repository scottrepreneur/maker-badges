import { configureApp } from "./app";
const port = process.env.APP_PORT || 3000;
configureApp().listen(port);
console.log(`Listening on port ${port}`);
