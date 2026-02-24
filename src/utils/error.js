export const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    GONE: 410,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    TOO_MANY_REQUEST: 429,
    CONFLICT: 409
};

export default (
    code = STATUS_CODE.INTERNAL_SERVER_ERROR,
    message = 'Something went wrong.'
) => {
    const error = new Error(message);
    error.code = typeof code === 'number' ? code : 500;
    return error;
};
