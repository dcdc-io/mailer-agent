import { config } from 'dotenv'
import { findTemplate, compileTemplate } from "./lib"
import nodemailer from 'nodemailer'
import fetch from 'node-fetch'
import { validate } from 'email-validator'

config()

const emailSafe = (str: string) => {
    if (validate(str.split("<").reverse()[0].trim().replace(">", ""))) {
        return str
    } else {
        throw "invalid email address"
    }
}

const {
    DOMAIN = "localhost",
    MESSAGE_DELAY = "10000",
    RECOVERY_TIME = "60000",
    EMAIL_FROM = "advocat. <advocat@dcdc.io>",
    SMTP_HOST = "localhost",
    SMTP_PASS,
    SMTP_PORT = "25",
    SMTP_USER,
    MAILER_USER,
    MAILER_PASS,
    PROTOCOL = "http",
    PORT
} = process.env

const wellKnownReplacements = {
    domain: DOMAIN
}

const loop = async () => {
    try {
        const transport = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        })
        const messages = await fetch(`${PROTOCOL}://${MAILER_USER}:${MAILER_PASS}@${DOMAIN}${PORT ? `:${PORT}` : ""}/db/mail_outbox/_all_docs?include_docs=true`).then(res => res.json()).then(data => data.rows.map((row: any) => row.doc))
        for (let doc of messages) {
            try {
                if (doc.status === "sent" || doc.type !== "email") {
                    continue
                }
                const template = await findTemplate(doc.template)
                const compiled = await compileTemplate(template, {
                    ...wellKnownReplacements,
                    ...doc.params
                })
                doc.status = "sent"
                // TODO: after sent actions
                // TODO: send mail
                const info = await transport.sendMail({
                    from: EMAIL_FROM,
                    to: emailSafe(doc.to.email || doc.to),
                    subject: compiled.metadata.subject,
                    text: compiled.text,
                    html: compiled.body
                })
                console.log(info)
                await fetch(`${PROTOCOL}://${MAILER_USER}:${MAILER_PASS}@${DOMAIN}${PORT ? `:${PORT}` : ""}/db/mail_outbox/${encodeURIComponent(doc._id)}?conflict=true`, {
                    method: "PUT",
                    body: JSON.stringify(doc),
                    headers: { 'Content-Type': 'application/json' }
                })
            } catch (error) {
                doc.status = "error"
                console.error(error)
                await fetch(`${PROTOCOL}://${MAILER_USER}:${MAILER_PASS}@${DOMAIN}${PORT ? `:${PORT}` : ""}/db/mail_outbox/${encodeURIComponent(doc._id)}?conflict=true`, {
                    method: "PUT",
                    body: JSON.stringify(doc),
                    headers: { 'Content-Type': 'application/json' }
                })
            }
        }
        setTimeout(loop, parseInt(MESSAGE_DELAY))
    } catch (error) {
        console.error(`[ERROR]: ${error}`)
        setTimeout(loop, parseInt(RECOVERY_TIME))
    }
}
loop()