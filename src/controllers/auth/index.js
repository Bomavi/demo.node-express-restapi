/* npm imports: common */
const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/* root imports: common */
const { jwt } = rootRequire('utils');

const ObjectId = mongoose.Types.ObjectId;
const BCRYPT_SALT = Number(process.env.BCRYPT_SALT) || 10;

const login = ({ User }) => async (req, res, next) => {
	try {
		const { username = '', password = '', isGuest = false } = req.body;
		let user;

		const credentials = {
			username: isGuest ? process.env.GUEST_USERNAME : username,
			password: isGuest ? process.env.GUEST_PASSWORD : password,
		};

		if (!credentials.username) throw createError(404, `username is required`);
		if (!credentials.password) throw createError(404, `password is required`);

		const foundUser = await User.findOne({ username: credentials.username });

		if (foundUser) {
			const isPasswordEqual = await bcrypt.compare(
				credentials.password,
				foundUser.password
			);

			if (!isPasswordEqual) {
				throw createError(
					401,
					`credentials for "${credentials.username}" invalid`
				);
			}
		}

		if (foundUser) user = foundUser;

		if (!foundUser && credentials.username === 'guest') {
			const hash = await bcrypt.hash(credentials.password, BCRYPT_SALT);

			if (!hash) throw createError(500, 'bcrypt failed');

			const newUser = await User.create({
				_id: ObjectId(),
				username: credentials.username,
				password: hash,
			});

			if (newUser) user = newUser;
		}

		if (!user) throw createError(401, `user not found or credentials invalid`);

		const publicUserInfo = await User.findById(user._id).getPublic();
		const token = await jwt.issue({ userId: publicUserInfo._id });

		req.session.accessToken = token;
		req.session.userId = publicUserInfo._id;
		res.status(200).send(publicUserInfo);
	} catch (e) {
		next(e);
	}
};

const register = ({ User }) => async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username) throw createError(404, `username is required`);
		if (!password) throw createError(404, `password is required`);

		const foundUser = await User.findOne({ username });

		if (foundUser) throw createError(405, `user "${username}" already exists`);

		const hash = await bcrypt.hash(password, BCRYPT_SALT);

		if (!hash) throw createError(500, 'bcrypt failed');

		const user = await User.create({
			_id: ObjectId(),
			username,
			password: hash,
		});

		const publicUserInfo = await User.findById(user._id).getPublic();
		const token = await jwt.issue({ userId: publicUserInfo._id });

		req.session.accessToken = token;
		req.session.userId = publicUserInfo._id;
		res.status(200).send(publicUserInfo);
	} catch (e) {
		next(e);
	}
};

const logout = () => async (req, res, next) => {
	try {
		req.session.destroy(err => {
			if (err) return next(err);

			res.status(200).send({ message: 'user was logged out successfuly' });
		});
	} catch (e) {
		next(e);
	}
};

const authenticate = ({ User }) => async (req, res, next) => {
	try {
		const { accessToken } = req.session;

		if (!accessToken) throw createError(401, 'user not authenticated');

		const { userId } = await jwt.validate(accessToken);
		const user = await User.findById(userId).getPublic();

		res.status(200).send(user);
	} catch (e) {
		next(e);
	}
};

module.exports = models => {
	const router = express();

	router.post('/login', login(models));
	router.post('/register', register(models));
	router.post('/logout', logout(models));
	router.post('/authenticate', authenticate(models));

	return router;
};
