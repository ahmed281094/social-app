import mongoose from "mongoose"

const connectionDB = ()=>{
    mongoose.connect(process.env.URI_CONNECTION).then(()=>{
        console.log("db connection done");
        
    }).catch((err)=>{
        console.log("connection faild",err);
        
    })
}
export default connectionDB