# mailer-agent

mailer-agent is a SMTP emailing agent that plucks outgoing messages from RSMQ and sends emails.

It is trivially simple, and there are likely many more suitable mailers out there so unless you already have RSMQ in your stack we don't suggest you use this. Of course, we don't mind what you do with it.

## Running:

You can either git clone and build this project, or as we do run it with docker:

`docker run benbabik/mailer-agent`

By default mailer-agent will look for a localhost instance of redis upon which to create the queues `mail_outbox` and `error`. From therein any message posted to `mail_outbox` will be processed for sending. Any failure sends a message to `error` and includes the original message and error details.

## Configuration:

mailer-agent is configured with environment variables, some of which have default values:

```bash
# common template parameters
DOMAIN = "localhost",
PRODUCT = "mailer",

# message loop timing
MESSAGE_DELAY = "1000",
RECOVERY_TIME = "5000",

# smtp config
EMAIL_FROM = "localhost <mail@localhost.local>",
SMTP_HOST = "localhost",
SMTP_PASS,
SMTP_PORT = "25",
SMTP_USER,

# redis config and RSMQ namespace
REDIS_HOST = "localhost",
REDIS_PORT = "6379",
RSMQ_NAMESPACE = "rsmq"
```

## RSMQ Message Format:

Messages sent to RSMQ are always strings, and in the case of mailer-agent, the messages sent to `mail_outbox` should be JSON stringifications of the `Message` type:

```typescript
/* mailer-agent message format */

type MessageTemplate = {
  template: string;
  params: Record<string, string>; // e.g. { "foo": "bar", "buzz": "fizz" }
  to: { name: string; email: string } | string;
};
```
## Message Templates:

Templates are markdown files stored in the templates subdirectory. Curly braces are used for template insertions and you can include a template into another by including the sub-template filename within curly braces. To include a signature from `signature.md` in `welcome.md` for example, your `welcome.md` file could be as follows:

```markdown
---
subject: welcome to {product}
---

Dear {name},

This is an email from {product} with a signature included.

{signature.md}
```

### Dynamic Template Variables:

The values within `MessageTemplate.params` may be function source code in the `function` format i.e. `function() {}`. When mailer-agent detects a parameter is a function it will `eval` it and then call it passing the replacements object as the first parameter. This is useful as it allows you to interpolate values that are not known at development time.

Here is a an example of such an instance where a message needs to insert the `{domain}` and `{token}` into a constructed URL:

```typescript
/**
 * example: somewhere in a web app server code
 *
 * here the url parameter needs to include the domain parameter that is known to the mailer-agent but unknown to the sending code
 * 
 **/

await rsmqSendMail({
    to: `"${name}" <${email}>`,
    template: "registration",
    params: {
        token,
        name,
        url: ({ domain, token }) => `https://${domain}/complete-registration/${token}`
    }
})
```
