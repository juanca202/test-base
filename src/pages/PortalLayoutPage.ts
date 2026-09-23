import { BasePage } from './BasePage';

const USER_MENU_BUTTON = 'role=banner >> role=button';
const LOGOUT_MENU_ITEM = 'role=menuitem[name="Cerrar sesión"]';

/**
 * Page Object of the authenticated portal shell (header with module tabs and user menu).
 */
export class PortalLayoutPage extends BasePage {
  /** Selector of the "Cerrar sesión" entry of the user menu. */
  static readonly LOGOUT_ITEM_SELECTOR = LOGOUT_MENU_ITEM;

  /** The shell has no page of its own; open the initial module. */
  async goto(): Promise<void> {
    await this.page.goto('/tasks');
    await this.waitForPageLoad();
  }

  /** Switch to another module using the main navigation tab. */
  async openModule(name: string): Promise<void> {
    await this.click(`role=tab[name="${name}"]`);
  }

  /** Open the user menu of the header. */
  async openUserMenu(): Promise<void> {
    await this.click(USER_MENU_BUTTON);
    await this.waitForElement(LOGOUT_MENU_ITEM);
  }

  /** End the session from the user menu. */
  async clickLogout(): Promise<void> {
    await this.click(LOGOUT_MENU_ITEM);
  }
}
