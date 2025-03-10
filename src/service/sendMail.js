import nodemailer from "nodemailer"
export const sendEmail = async (to, subject,html) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `"abo 7med👻" <${process.env.EMAIL}>`, // sender address
        to: to ? to : "ahmedhesham281094@gmail.com", // list of receivers
        subject: subject ? subject : "Hello ✔", // Subject line
        html:html?html:""
    });
    if (info.accepted.length) {
        return true
    }
    return false;
}