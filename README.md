## Commands

- `npm start` - to start dev build
- `npm run build` - to build prod version

## Widget initialization

```
const $input = $form.querySelector("#input");
const emailsInput = new EmailsInput({
  $el: $input
});
```

## Subscribing to events

```
$input.addEventListener("addEmail", (event) => {
  console.log(event, event.detail);
});
```

## Public api

- `destroy` - destroy instace of widget and do clean up
- `add` - add emails (array or string of emails separated by `,`)
- `resetAll` - replace all current emails with provided list (array or string of emails separated by `,`)
- `getCount` - get amount of emails
- `getAll` - get all emails
- `getValid` - get all valid emails
- `getInvalid` - get all invalid emails

## Events

- `render` - triggered when widget completed rendering
- `destroy` - triggered when widget destroy
- `addEmail` - triggered when new email is added
- `removeEmail` - triggered when email was removed
