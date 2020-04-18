const express = require('express');
const router = express.Router();
const User = require('../models/User')
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth');

//Insert/Register a user
router.post('/register', [
    check('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email.')
        .normalizeEmail(),
    check('password')
        .trim()
        .isLength({ min: 8}).withMessage('a min. of 8 characters')
        .matches(/(?=.*[a-z])/).withMessage('one lowercase letter')
        .matches(/(?=.*[A-Z])/).withMessage('one uppercase letter')
        .matches(/(?=.*\d)/).withMessage('one digit')
        .matches(/(?=.*[!@#$*_.])/).withMessage('one special character (!@#$*_.)'),
    check('confirm_pw').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match.');
        }

        return true;
    })
], 
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).send(errors.array());
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    await bcrypt.genSalt(10, (err, salt) => {
        if(err) throw err;

        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) throw err;

            user.password = hash;

            user.save()
                .then(() => {
                    req.logIn(user, (err) => {
                        if(err) return next(err);
                        
                        let new_user  = {
                            _id: req.user._id,
                            email: req.user.email
                        }
        
                        return res.status(200).send({message: `Welcome ${user.email}!`, user: new_user});
                    });
                })
                .catch(() => {
                    res.status(409).send({error: `Email '${user.email}' is already in use by another user.`});
                });
        });
    });
});

router.post('/login', async (req, res, next) => {
    try {
        await passport.authenticate('local', (err, user, info) => {
            if(err) return next(err);

            if(!user) {
                return res.status(401).send({ message: info.message})
            }

            req.logIn(user, (err) => {
                if(err) return next(err);
                
                let user  = {
                    _id: req.user._id,
                    email: req.user.email
                }

                return res.status(200).send({message: 'Successfully logged in.', user: user});
            });
        })(req, res, next);
    } catch (error) {
        res.status(401).send({ message: 'Could not log in.' });
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(error => {
        if(error) throw error;

        res.clearCookie('session_id');
        res.status(200).send({ message: 'Succcesfully logged out!' });
    });
});

router.get('/check_auth', ensureAuthenticated, (req, res) => {
    let user  = {
        _id: req.user._id,
        email: req.user.email
    }

    res.status(200).send({ is_logged_in: true, user: user});
});

module.exports = router;