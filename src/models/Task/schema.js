/* npm imports: common */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema(
	{
		description: {
			type: String,
			required: true,
		},
		completed: {
			type: Boolean,
			required: true,
		},
		createdBy: {
			type: ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

schema.query.search = function(value) {
	const val = value.toLowerCase();
	return this.where({ description: new RegExp(val, 'i') });
};

schema.query.createdBy = function(userId) {
	return this.where({
		createdBy: userId,
	});
};

schema.query.getPublic = function() {
	return this.select('-createdBy -__v');
};

module.exports = { schema };
