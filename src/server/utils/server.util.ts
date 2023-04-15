import bcrypt from 'bcrypt';
const saltRounds = 10;

export const generatePasswordHash = (passwordPlain) => {
    return bcrypt.hashSync(passwordPlain, saltRounds);
}

export async function checkUser(password, hashedPassword) {
    //... fetch user from a db etc.

    const match = await bcrypt.compare(password, hashedPassword);

    if(match) {
        //login
        console.log("MATCH");
        
    } else {
        console.log("NO MATCH");
        
    }

    //...
}