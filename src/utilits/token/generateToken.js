import  jwt  from 'jsonwebtoken';
export const generateToken = async ({payload={},SIGNATURE,option})=>{
    return jwt.sign(
        payload  ,   
        SIGNATURE ,
        option      
        )
}