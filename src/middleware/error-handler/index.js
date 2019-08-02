/* npm imports: common */
const createError = require('http-errors');

/* root imports: common */
const { logger } = rootRequire('utils');

const errorHandler = (err, _req, res, _next) => {
	const error =
		err instanceof createError.HttpError
			? err
			: createError(500, 'InternalServerError');

	if (process.env.NODE_ENV !== 'production') {
		logger.error(`${error.statusCode || error.status} %O`, err.message);
	}

	if (['ValidationError', 'UserExistsError'].includes(err.name)) {
		return res.status(405).json(err);
	}

	return res.status(error.status).json({
		code: error.statusCode || error.status,
		message: error.message || error.error,
	});
};

module.exports = errorHandler;
