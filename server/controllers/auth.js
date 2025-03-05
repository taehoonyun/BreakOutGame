const mRes = require("../module/commonResponse");

module.exports.login = async (req, res) => {
  if (req.body && req.body.params) {
    const { userId } = req.body.params;
    if (!userId) {
      return res.status(400).json({ message: "Username is required!" });
    }
    if (true) {
      // if (await bcrypt.compare(password, user.PASSWORD)) {
      //     // const { token, exp } = authUtil.generateLoginToken(id);
      mRes.sendJSON(res, 200, {
        result: true,
        data: { userId, message: "Login Success!" },
      });
      //     // mRes.sendJSON(res, 200, {
      //     //     name: user.USER_NAME,
      //     //     token,
      //     //     exp,
      //     //     role: user.ROLE,
      //     //     isNotification: user.NOTIFICATION
      //     // });
      // } else {
      // mRes.sendJSONError(res, 400, 'The password is incorrect.');
      // }
    } else {
      // mRes.sendJSONError(res, 400, 'Unregistered user.');
    }
  } else {
    // mRes.sendJSONError(res, 401, 'Invalid login data.');
  }
};
