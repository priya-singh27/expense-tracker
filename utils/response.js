const successResponse = (res, data, message) => {
    res.json({
        code: 200,
        data: data,
        message: message
    });
};
const serverErrorResponse = (res, message) => {
    res.json({
        code: 500,
        message:message,
    });
};

const badRequestResponse = (res, message) => {
    res.json({
        code: 400,
        message: message
    });
};

const unauthorizedResponse = (res, message) => {
    res.json({
        code: 401,
        message: message
    });
};

const forbiddenResponse = (res,message) => {
    res.json({
        code: 403,
        message:message
    });
};

const notFoundResponse = (res, message) => {
    res.json({
        code: 404,
        message: message
    });
};

const handle304 = (error, res) => {
    if (error.message.includes("304")) {
        console.log("304 error received from DB server");
        return res.status(304).send(`Request failed with status code: 304`);
    }
}

module.exports = {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    unauthorizedResponse,
    notFoundResponse,
    handle304

}