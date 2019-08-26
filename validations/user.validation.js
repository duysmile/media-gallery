const Joi = require('@hapi/joi');
const Constants = require('../common/constants');

const createUser = function() {
    return {
        body: {
            username: Joi.string().required().min(3).max(30).alphanum(),
            password: Joi.string().required().min(5).max(30),
            email: Joi.string().email().required().max(300),
            gender: Joi.string().valid(['Male', 'Female', 'Other']).required(),
            geoPosition: Joi.array().items(Joi.number())
        },
        query: {},
        params: {}
    }; 
};

const updateUser = function() {
    return {
        body: 
            Joi.object().keys({
                username: Joi.string().min(3).max(30).alphanum(),
                password: Joi.string().min(5).max(30),
                email: Joi.string().email().max(300),
                gender: Joi.string().valid(['Male', 'Female', 'Other']),
                geoPosition: Joi.array().items(Joi.number())
            }).or('username', 'password', 'email', 'gender', 'geoPosition'),
        params: {
            id: Joi.string().regex(Constants.REGEX.OBJECT_ID).required()
        }
    };
};

const paramId = function() {
    return {
        params: {
            id: Joi.string().regex(Constants.REGEX.OBJECT_ID)
        }
    }
};

const forgotPassword = function() {
    return {
        body: {
            email: Joi.string().email().required().max(300)
        }
    };
};

const resetPassword = function() {
    return {
        body: {
            code: Joi.string().max(300).required(),
            password: Joi.string().min(5).max(30).required(),
            password_confirmation: Joi.any().valid(Joi.ref('password')).required()
        }
    }
}

module.exports = {
    createUser,
    updateUser,
    paramId,
    forgotPassword,
    resetPassword
};