import "./index.scss";

type Email = {
  id: string;
  value: string;
  isValid: boolean;
};

type State = {
  emails: Array<Email>;
};

type Count = {
  valid: number;
  invalid: number;
  total: number;
};

type Props = {
  $el: HTMLElement;
};

enum Actions {
  RENDER = "render",
  DESTROY = "destroy",
  ADD_EMAIL = "addEmail",
  REMOVE_EMAIL = "removeEmail",
  FOCUS_INPUT = "focusInput"
}

class EmailsInput {
  private state: State = {
    emails: []
  };

  private $root: HTMLElement;
  private $widget: HTMLElement | null = null;
  private $input: HTMLElement | null = null;
  private className: string = "emails-input-widget";

  constructor({ $el }: Props) {
    this.$root = $el;

    this.renderWidget();
    this.addEventListeners();
  }

  private setState(nextState: Partial<State>, callback?: () => void): void {
    this.state = {
      ...this.state,
      ...nextState
    };

    this.updateWidgetOnStateChange();

    if (callback) {
      callback();
    }
  }

  private resetState(): void {
    this.setState({
      emails: []
    });
  }

  // Clientside usage only
  private generateId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // This is very naive way of sanitizing input, a proper library should be
  // used instead at least, like: https://github.com/jitbit/HtmlSanitizer
  private sanitize(input: string): string {
    const map: any = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
      "`": "&grave;"
    };
    return input.replace(/[&<>"'/`]/gi, (match: string) => {
      return map[match];
    });
  }

  private clearInputEl(): void {
    if (this.$input) {
      this.$input.innerHTML = "";
    }
  }

  private onInputKeydown = (event: KeyboardEvent): void => {
    // event.which for IE fallback
    if (
      event.which === 13 ||
      event.which === 188 ||
      event.key === "," ||
      event.key === "Enter"
    ) {
      event.preventDefault();

      const target: HTMLElement = event.target as HTMLElement;
      const { innerText }: { innerText: string } = target;

      if (innerText) {
        this.add(innerText);
        this.clearInputEl();
      }
    }
  };

  private onInputPaste = (event: ClipboardEvent): void => {
    let clipboardData: string | null = null;

    if (typeof event.clipboardData === "undefined") {
      clipboardData = (window as any).clipboardData.getData("Text");
    } else if (event.clipboardData) {
      clipboardData = event.clipboardData.getData("text/plain");
    }

    if (clipboardData) {
      event.preventDefault();
      this.add(clipboardData);
      this.clearInputEl();
    }
  };

  private onInputBlur = (event: FocusEvent): void => {
    const target: HTMLElement = event.target as HTMLElement;
    const { innerText }: { innerText: string } = target;

    if (innerText) {
      this.add(innerText);
      this.clearInputEl();
    }
  };

  private onWidgetClick = (event: MouseEvent): void => {
    const target: HTMLElement = event.target as HTMLElement;
    const { action }: { action?: string } = target.dataset;

    switch (action) {
      case Actions.REMOVE_EMAIL:
        const key: string | undefined = (target.parentNode as HTMLElement)
          .dataset.key;

        if (key) {
          this.remove(key);
        }
        break;
      case Actions.FOCUS_INPUT:
        if (this.$input) {
          // Special ie case
          if ((this.$input as any).setActive) {
            (this.$input as any).setActive();
          } else {
            this.$input.focus();
          }
        }
    }
  };

  private addEventListeners(): void {
    if (this.$input) {
      this.$input.addEventListener("keydown", this.onInputKeydown);
      this.$input.addEventListener("paste", this.onInputPaste);
      this.$input.addEventListener("blur", this.onInputBlur);
    }

    if (this.$widget) {
      this.$widget.addEventListener("click", this.onWidgetClick);
    }
  }

  private removeEventListeners(): void {
    if (this.$input) {
      this.$input.removeEventListener("keydown", this.onInputKeydown);
      this.$input.removeEventListener("paste", this.onInputPaste);
      this.$input.removeEventListener("blur", this.onInputBlur);
    }

    if (this.$widget) {
      this.$widget.removeEventListener("click", this.onWidgetClick);
    }
  }

  private parseEmailsString(emailsString: string): Array<string> {
    const emails: Array<string> = emailsString
      .split(",")
      .map(email => email.replace(/^\s+|\s+$/g, ""))
      .filter(email => email);

    return emails;
  }

  // Typically FE validation shouldn't be complicated, strict
  // validation should be done on backend side
  private validateEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  private generateEmailList(emails: string | Array<string>): Array<Email> {
    const emailsList: Array<string> =
      typeof emails === "string" ? this.parseEmailsString(emails) : emails;

    return emailsList.map(email => {
      return {
        id: this.generateId(),
        value: this.sanitize(email),
        isValid: this.validateEmail(email)
      };
    });
  }

  private removeDOMElements(): void {
    this.$root.innerHTML = "";
  }

  private trigerEvent(type: Actions, data?: any): void {
    let event;

    if (typeof window.CustomEvent === "function") {
      event = new CustomEvent(type, { detail: data });
    } else {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(type, false, false, data);
    }

    this.$root.dispatchEvent(event);
  }

  private trigerEventsForList(event: Actions, list: Array<any>): void {
    list.forEach(item => {
      this.trigerEvent(event, item);
    });
  }

  private createInputFieldEl(): HTMLElement {
    const $input = document.createElement("div");
    $input.classList.add(`${this.className}__input`);
    $input.setAttribute("contenteditable", "true");

    return $input;
  }

  private createEmailEl(email: Email): HTMLElement {
    const $email: HTMLElement = document.createElement("div");
    $email.dataset.key = email.id;
    $email.classList.add(`${this.className}__email`);
    if (!email.isValid) {
      $email.classList.add(`${this.className}__email--invalid`);
    }

    const $value: HTMLElement = document.createElement("span");
    $value.innerHTML = email.value;
    $value.classList.add(`${this.className}__email-value`);
    $email.appendChild($value);

    const $remove: HTMLElement = document.createElement("span");
    $remove.classList.add(`${this.className}__email-remove`);
    $remove.dataset.action = Actions.REMOVE_EMAIL;
    $email.appendChild($remove);

    return $email;
  }

  private renderWidget(): void {
    const $widget = document.createElement("div");
    $widget.dataset.action = Actions.FOCUS_INPUT;
    $widget.classList.add(this.className);

    const $input = this.createInputFieldEl();
    $widget.appendChild($input);

    const $emails: DocumentFragment = document.createDocumentFragment();
    this.state.emails.forEach(
      (email: Email): void => {
        $emails.appendChild(this.createEmailEl(email));
      }
    );
    $widget.insertBefore($emails, $input);

    this.$root.appendChild($widget);

    this.$widget = $widget;
    this.$input = $input;

    this.trigerEvent(Actions.RENDER);
  }

  private getRenderedEmails(): Array<{ key: string; $el: HTMLElement }> {
    if (this.$widget) {
      return Array.prototype.slice
        .call(this.$widget.childNodes)
        .map((node: ChildNode) => {
          const {
            dataset: { key }
          } = node as HTMLElement;
          return {
            key: typeof key !== "undefined" ? key : "",
            $el: node as HTMLElement
          };
        })
        .filter(email => email.key);
    } else {
      return [];
    }
  }

  private renderNewEmails(renderedEmailsKeys: Array<string>): void {
    if (this.$widget) {
      const { emails } = this.state;
      const newEmails: Array<Email> = emails.filter(
        (email: Email): boolean => {
          return renderedEmailsKeys.indexOf(email.id) === -1;
        }
      );

      if (newEmails && newEmails.length) {
        const $newEmails: DocumentFragment = document.createDocumentFragment();
        newEmails.forEach(
          (email: Email): void => {
            $newEmails.appendChild(this.createEmailEl(email));
          }
        );
        this.$widget.insertBefore($newEmails, this.$input);
      }
    }
  }

  private removeDeletedEmails(
    renderedEmails: Array<{ key: string; $el: HTMLElement }>
  ): void {
    const existingEmailsKeys: Array<string> = this.state.emails.map(
      email => email.id
    );
    const deletedEmails = renderedEmails.filter(
      (email): boolean => {
        return existingEmailsKeys.indexOf(email.key) === -1;
      }
    );

    deletedEmails.forEach(
      (email): void => {
        if (this.$widget) {
          this.$widget.removeChild(email.$el);
        }
      }
    );
  }

  private updateWidgetOnStateChange(): void {
    const renderedEmails = this.getRenderedEmails();
    const renderedEmailsKeys: Array<string> = renderedEmails.map(
      email => email.key
    );
    this.renderNewEmails(renderedEmailsKeys);
    this.removeDeletedEmails(renderedEmails);
  }

  private remove = (id: string): void => {
    const emails = this.state.emails.filter(
      (email): boolean => {
        return email.id !== id;
      }
    );

    this.setState(
      {
        emails
      },
      () => {
        this.trigerEvent(Actions.REMOVE_EMAIL);
      }
    );
  };

  public getAll(): Array<Email> {
    return this.state.emails;
  }

  public getValid(): Array<Email> {
    return this.getAll().filter(email => email.isValid);
  }

  public getInvalid(): Array<Email> {
    return this.getAll().filter(email => !email.isValid);
  }

  public getCount(): Count {
    const valid = this.getValid().length;
    const invalid = this.getInvalid().length;

    return {
      valid,
      invalid,
      total: valid + invalid
    };
  }

  public resetAll(emails: string | Array<string>): void {
    const emailList = this.generateEmailList(emails);

    this.setState(
      {
        emails: emailList
      },
      () => {
        this.trigerEventsForList(Actions.ADD_EMAIL, emailList);
      }
    );
  }

  public add(emails: string | Array<string>): void {
    const emailList = this.generateEmailList(emails);

    this.setState(
      {
        emails: [...this.state.emails, ...emailList]
      },
      () => {
        this.trigerEventsForList(Actions.ADD_EMAIL, emailList);
      }
    );
  }

  public destroy(): void {
    this.resetState();
    this.removeEventListeners();
    this.removeDOMElements();
    this.trigerEvent(Actions.DESTROY);
  }
}

export default EmailsInput;
