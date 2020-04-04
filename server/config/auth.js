module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        } 

        res.status(401).send({ message: 'Please login first.'} );
    }
}