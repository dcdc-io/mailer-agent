import { config } from 'dotenv'
import { findTemplate, compileTemplate } from "./lib"
import nodemailer from 'nodemailer'
import { validate } from 'email-validator'
import RedisSMQ, { QueueMessage } from 'rsmq'

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
    PRODUCT = "mailer",
    MESSAGE_DELAY = "1000",
    RECOVERY_TIME = "5000",
    EMAIL_FROM = "localhost <mail@localhost.local>",
    SMTP_HOST = "localhost",
    SMTP_PASS,
    SMTP_PORT = "25",
    SMTP_USER,
    REDIS_HOST = "localhost",
    REDIS_PORT = "6379",
    RSMQ_NAMESPACE = "rsmq"
} = process.env

const rsmq = new RedisSMQ({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
    ns: RSMQ_NAMESPACE
})

rsmq.createQueueAsync({ qname: "mail_outbox" }).catch(e => { })
rsmq.createQueueAsync({ qname: "error" }).catch(e => { })

const wellKnownReplacements = {
    domain: DOMAIN,
    product: PRODUCT,
}

type Message = {
    template: string
    params: Record<string, string>
    to: { name: string, email: string } | string
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
        const message = await rsmq.receiveMessageAsync({ qname: "mail_outbox" })

        if ((message as QueueMessage).id) {
            try {
                const doc: Message = JSON.parse((message as any).message)
                console.log(`[MESSAGE]: ${JSON.stringify(doc)}`)
                const template = await findTemplate(doc.template)
                const compiled = await compileTemplate(template, {
                    ...wellKnownReplacements,
                    ...doc.params
                })
                const info = await transport.sendMail({
                    from: EMAIL_FROM,
                    to: emailSafe((doc.to as any).email || doc.to),
                    subject: compiled.metadata.subject,
                    text: compiled.text,
                    html: compiled.body
                })
                console.log(`[SENT]: ${info}`)
            } catch (error) {
                console.error(`[ERROR]: ${error}`)
                await rsmq.sendMessageAsync({
                    qname: "error", message: JSON.stringify({
                        message: message,
                        qname: "mail_outbox",
                        error: JSON.stringify(error)
                    })
                })
            } finally {
                await rsmq.deleteMessageAsync({ qname: "mail_outbox", id: (message as QueueMessage).id })
            }
        }
        setTimeout(loop, parseInt(MESSAGE_DELAY))
    } catch (error) {
        console.error(`[ERROR]: ${error}`)
        setTimeout(loop, parseInt(RECOVERY_TIME))
    }
}
loop()