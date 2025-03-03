module.exports.login = async (req, res) => {
    console.log(req);
    
    if (req.body && req.body.id && req.body.password) {
        const { id } = req.body;

        if (true) {
            // if (await bcrypt.compare(password, user.PASSWORD)) {
            //     // const { token, exp } = authUtil.generateLoginToken(id);

            //     // mRes.sendJSON(res, 200, {
            //     //     name: user.USER_NAME,
            //     //     token,
            //     //     exp,
            //     //     role: user.ROLE,
            //     //     isNotification: user.NOTIFICATION 
            //     // });
            // } else {
            //     // mRes.sendJSONError(res, 400, 'The password is incorrect.');
            // }
        } else {
            // mRes.sendJSONError(res, 400, 'Unregistered user.');
        }
    } else {
        // mRes.sendJSONError(res, 401, 'Invalid login data.');
    }
};
