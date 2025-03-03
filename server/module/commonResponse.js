// sendJSON(res, 200, { result: "ok" });
// sendJSON(res, 200, {
//     name: "NOT USER",
//     token,
//     exp: null,
//     role: "History,Dashboard",
// });
const sendJSON = (res, status, content) => {
    try {
        res.status(status);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.json(content);
    } catch (e) {}
};

const sendJSONMessage = (res, status, pMsg) => {
    sendJSON(res, status, { msg: pMsg });
};

const sendJSONError = (res, status, pErr) => {
    sendJSON(res, status, { err: pErr });
};

module.exports = { sendJSON, sendJSONMessage, sendJSONError };
