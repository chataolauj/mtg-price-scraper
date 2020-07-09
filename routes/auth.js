const express = require('express');
const router = express.Router();
const User = require('../models/User')
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth');
const crypto = require('crypto')
const nodemailer = require('nodemailer')

//Insert/Register a user
router.post('/register', 
    [
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
            .matches(/(?=.*[!@#$*_.])/).withMessage('one of these special characters (!*@_#.$*)'),
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
            
                            return res.status(200).send({message: `Welcome ${user.email}!`, email: user.email});
                        });
                    })
                    .catch(() => {
                        res.status(409).send({error: `Email '${user.email}' is already in use by another user.`});
                    });
            });
        });
    }
);

router.post('/login', async (req, res, next) => {
    try {
        await passport.authenticate('local', (err, user, info) => {
            if(err) return next(err);

            if(!user) {
                return res.status(401).send({ message: info.message})
            }

            req.logIn(user, (err) => {
                if(err) return next(err);

                return res.status(200).send({message: 'Successfully logged in.', email: user.email});
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
    res.status(200).send({ is_logged_in: true, email: req.user.email});
});

router.post('/forgot-password', 
    [
        check('email').custom(async (email) => {
            return await User.findOne({email: email})
            .then(user => {
                if(!user) {
                    return Promise.reject(`No account registered under ${email}.`)
                }
            });
        })
    ],
    async (req, res) => {
        try {
            let token = crypto.randomBytes(20).toString('hex');

            await User.updateOne(
                {email: req.body.email},
                {$set: {reset_password_token: token, reset_password_expires: Date.now() + 15 * 60 * 1000}}
            )

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'mtgpricescraper@gmail.com',
                    pass: process.env.SCRAPER_EMAIL_PASS
                }
            });
        
            let mailOptions = {
                from: 'MTG Price Scraper <noreply.mtgpricescraper@gmail.com>',
                replyTo: 'noreply.mtgpricescraper@gmail.com',
                to: req.body.email,
                subject: 'Password Reset',
                text: 
                    `You are receiving this email because you, or someone, requested a password reset for your account.`
                    + `\n\nPlease click the following link, or paste it into your browser, to continue the password reset process:`
                    + `\n${process.env.PORT || 8080}/${token}`
                    + `\n\nIf you did not request a password reset for your account, then please ignore this email and your password will remain unchanged.`
            };
        
            transporter.sendMail(mailOptions, (err) => {
                if(err) throw err;

                res.status(200).send({ message: `Password reset email has been sent to ${req.body.email}.` })
            })
        } catch (error) {
            
        }
    }
);

router.get('/reset-password/:token', async (req, res) => {
    try {
        await User.findOne(
            {reset_password_token: req.params.token, reset_password_expires: {$gt: Date.now()}},
            (err, user) => {
                if(err) throw err;

                if(!user) {
                    res.status(404).send({ message: 'Password reset token is invalid or has expired.' })
                }
                else {
                    res.status(204).send();
                }
            }
        )
    } catch (error) {
        res.send({ message: err })
    }
});

router.patch('/reset-password/:token',
    async (req, res, next) => {
        try {
            await User.findOne(
                {reset_password_token: req.params.token, reset_password_expires: {$gt: Date.now()}},
                (err, user) => {
                    if(err) throw err;

                    if(!user) {
                        res.status(404).send({ message: 'Password reset token is invalid or has expired.' })
                    }
                    else (
                        next()
                    )
                }
            )
        } catch (error) {
            res.send({ message: err })
        }
    },
    [
        check('new_password')
            .trim()
            .isLength({ min: 8}).withMessage('a min. of 8 characters')
            .matches(/(?=.*[a-z])/).withMessage('one lowercase letter')
            .matches(/(?=.*[A-Z])/).withMessage('one uppercase letter')
            .matches(/(?=.*\d)/).withMessage('one digit')
            .matches(/(?=.*[!@#$*_.])/).withMessage('one special character (!@#$*_.)'),
        check('confirm_new_pw').custom((value, {req}) => {
            if(value !== req.body.new_password) {
                throw new Error('Your new passwords do not match.');
            }

            return true;
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).send(errors.array());
        }

        try {
            await bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err;
        
                bcrypt.hash(req.body.new_password, salt, async (err, hash) => {
                    if(err) throw err;
        
                    await User.updateOne(
                        {reset_password_token: req.params.token},
                        {$set: {password: hash, reset_password_token: undefined, reset_password_expires: undefined}},
                        (err) => {
                            if(err) throw err;

                            res.status(200).send({ message: 'Your password was successfully updated!'});
                        }
                    )
                });
            });
        } catch (error) {
            res.status(400).send({ message: error });
        }
    }
)

module.exports = router;