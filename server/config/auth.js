module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        } 

        res.status(401).send({ message: 'You are currently not logged in.'} );
    }
}