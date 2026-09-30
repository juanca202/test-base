import { BasePage } from './BasePage';

const HEADING = 'role=heading[name="Iniciar sesión"]';
const USERNAME_INPUT = 'role=textbox[name="Usuario"]';
const PASSWORD_INPUT = 'role=textbox[name="Contraseña"]';
const SUBMIT_BUTTON = 'role=button[name="Iniciar sesión"]';
const ERROR_ALERT = 'role=alert';

/**
 * Page Object of the portal login screen (`/signin`).
 */
export class LoginPage extends BasePage {
  /** Selector of the login screen heading. */
  static readonly HEADING_SELECTOR = HEADING;

  /** Selector of the login submit button. */
  static readonly SUBMIT_SELECTOR = SUBMIT_BUTTON;

  /** Notice shown when the user is sent back to the login after the session expired. */
  static readonly SESSION_EXPIRED_MESSAGE =
    'Tu sesión ha expirado. Vuelve a iniciar sesión.';

  /** Open the portal root; without a session it redirects to the login. */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /** Type the username in the login form. */
  async fillUsername(username: string): Promise<void> {
    await this.fill(USERNAME_INPUT, username);
  }

  /** Type the password in the login form. */
  async fillPassword(password: string): Promise<void> {
    await this.fill(PASSWORD_INPUT, password);
  }

  /** Submit the login form. */
  async clickSubmit(): Promise<void> {
    await this.click(SUBMIT_BUTTON);
  }

  /** Fill both fields and submit the form. */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  /**
   * Log in and wait until the portal lands on its initial module.
   * @param username - Account name.
   * @param password - Account password.
   */
  async loginAndWaitForPortal(
    username: string,
    password: string
  ): Promise<void> {
    await this.login(username, password);
    await this.page.waitForURL(/\/tasks/, { timeout: 30000 });
  }

  /** Text of the error alert shown after a failed login attempt. */
  async getErrorMessage(): Promise<string> {
    return (await this.getText(ERROR_ALERT)).trim();
  }

  /** Current value of the password field. */
  async getPasswordValue(): Promise<string> {
    return await this.page.locator(PASSWORD_INPUT).inputValue();
  }
}
