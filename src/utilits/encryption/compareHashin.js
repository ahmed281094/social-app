import  bcrypt  from 'bcrypt';

export const compareHashing = async({key,hashed})=>{
    return bcrypt.compareSync(key, hashed)
}