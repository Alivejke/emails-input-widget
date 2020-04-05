import EmailsInput from "./components/EmailsInput";

function simpleRandomNumber(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

function getRandomEmail(): string {
  let email: string = "";
  const randomChars: Array<string> = "_qwertyuiopasdfghjkl159".split("");

  for (let i = 0; i <= simpleRandomNumber(10); i++) {
    email += randomChars[simpleRandomNumber(randomChars.length - 1)];
  }

  return `${email}@mail.ru`;
}

function initializeEmailsInputForm($form: HTMLElement): void {
  const $input: HTMLElement | null = $form.querySelector(
    "[data-widget='EmailsInput']"
  );

  if (!$input) return;

  const emailsInput = new EmailsInput({
    $el: $input
  });

  $form.addEventListener("click", (event: MouseEvent) => {
    const target: EventTarget | null = event.target;

    if (!(target instanceof HTMLElement)) return;

    const action: string | undefined = target.dataset.action;

    if (action) {
      event.preventDefault();

      switch (action) {
        case "addRandomEmail":
          const randomEmail: string = getRandomEmail();
          emailsInput.add(randomEmail);
          break;
        case "showValidEmailsCount":
          const { valid }: { valid: number } = emailsInput.getCount();
          alert(`Valid emails count is: ${valid}`);
          break;
      }
    }
  });
}

const $form: HTMLElement | null = document.querySelector(".email-form");

if ($form) {
  initializeEmailsInputForm($form);
}
