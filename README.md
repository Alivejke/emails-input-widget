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

* `destroy` - destroy instace of widget and do clean up
* `add` - add emails (array or string of emails separated by `,`)
* `resetAll` - replace all current emails with provided list (array or string of emails separated by `,`)
* `getCount` - get amount of emails
* `getAll` - get all emails
* `getValid` - get all valid emails
* `getInvalid` - get all invalid emails
