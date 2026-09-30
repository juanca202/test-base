import { BasePage } from './BasePage';

const USER_MENU_BUTTON = 'role=banner >> role=button';
const LOGOUT_MENU_ITEM = 'role=menuitem[name="Cerrar sesión"]';
const HAMBURGER_BUTTON =
  'role=banner >> role=button[name=/menú|menu|hamburgues|navegación/i]';

const SIDEBAR_LOGOUT_BUTTON = '.sidebar__logout';
const SIDEBAR_COLLAPSE_BUTTON =
  'role=button[name=/plegar|colapsar|contraer|collapse/i]';

/** Main navigation destinations of the authenticated portal. */
export const NAVIGATION_DESTINATIONS = [
  'Mis tareas',
  'Procesos',
  'Rendimiento',
];

/**
 * Page Object of the authenticated portal shell (header with module tabs and user menu).
 */
export class PortalLayoutPage extends BasePage {
  /** Selector of the "Cerrar sesión" entry of the user menu. */
  static readonly LOGOUT_ITEM_SELECTOR = LOGOUT_MENU_ITEM;

  /** Selector of the logout button documented in the footer of a side menu. */
  static readonly SIDEBAR_LOGOUT_SELECTOR = SIDEBAR_LOGOUT_BUTTON;

  /** Selector of the control that collapses a side menu. */
  static readonly SIDEBAR_COLLAPSE_SELECTOR = SIDEBAR_COLLAPSE_BUTTON;

  /** The shell has no page of its own; open the initial module. */
  async goto(): Promise<void> {
    await this.page.goto('/tasks');
    await this.waitForPageLoad();
  }

  /** Switch to another module using the main navigation tab. */
  async openModule(name: string): Promise<void> {
    await this.click(`role=tab[name="${name}"]`);
  }

  /**
   * Switch module without retries, failing after a short timeout. For flows where the
   * portal may leave the shell on its own (e.g. session expiry) before the click.
   */
  async openModuleWithin(name: string, timeout: number): Promise<void> {
    await this.page.getByRole('tab', { name }).click({ timeout });
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

  /** Whether the navigation tab of a destination is visible. */
  async isDestinationVisible(name: string): Promise<boolean> {
    return await this.page.getByRole('tab', { name }).isVisible();
  }

  /** Whether the text label of a destination is visible (not collapsed to an icon). */
  async isDestinationLabelVisible(name: string): Promise<boolean> {
    return await this.page
      .getByRole('tab', { name })
      .getByText(name, { exact: true })
      .isVisible();
  }

  /** Number of main navigation tab bars currently rendered (detects duplicated navigation). */
  async countNavigationBars(): Promise<number> {
    return await this.page.getByRole('tablist').count();
  }

  /** Whether a hamburger control to expand the navigation is shown. */
  async hasHamburgerControl(): Promise<boolean> {
    return await this.page.locator(HAMBURGER_BUTTON).isVisible();
  }

  /** Whether the page scrolls horizontally, i.e. content overflows the viewport. */
  async hasHorizontalOverflow(): Promise<boolean> {
    return (
      (await this.page.evaluate(
        'document.documentElement.scrollWidth > document.documentElement.clientWidth'
      )) === true
    );
  }

  /** Interact with the collapsed navigation so that it expands (hover the tab bar). */
  async expandNavigation(): Promise<void> {
    await this.page
      .getByRole('tablist', { name: 'Navegación principal' })
      .hover();
  }

  /** Open the overlay navigation panel with the hamburger control. */
  async openNavigationPanel(): Promise<void> {
    await this.click(HAMBURGER_BUTTON);
  }
}
