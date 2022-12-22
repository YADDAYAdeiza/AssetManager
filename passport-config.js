const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initializePassport(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email,password, done)=>{
        const user =  await getUserByEmail(email);
        console.log('**')
        // console.log(user);
        if (user == null){
            return done(null,false, {message:'No user with that email'})
        }
        try {
            //console.log(password);
            //console.log(user);
            console.log('This is the user password ', user.password);
            if (await bcrypt.compare(password, user.password)){
                console.log('Matched');
                done(null, user)
            } else{
                return done(null, false, {message:'Password incorrect'})
            }
        }catch(e){
            return done(e);
        }
    }
    passport.use(new LocalStrategy({ usernameField:'email'}, authenticateUser));
    passport.serializeUser((user, done)=>{done(null, user.id)})
    passport.deserializeUser(async (id, done)=>{
        console.log('ID to get user by: ', id);
        return done(null,  await getUserById(id))});
}

module.exports = initializePassport;