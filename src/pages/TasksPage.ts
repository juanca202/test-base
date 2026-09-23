import { BasePage } from './BasePage';

const HEADING = 'role=heading[name="Mis tareas"]';
const SEARCH_INPUT = 'role=textbox[name="Buscar"]';

/**
 * Page Object of the "Mis tareas" module (`/tasks`), the initial protected module.
 */
export class TasksPage extends BasePage {
  /** Selector of the module heading. */
  static readonly HEADING_SELECTOR = HEADING;

  /** Path of the module in the portal. */
  static readonly PATH = '/tasks';

  /** Open the module directly by URL. */
  async goto(): Promise<void> {
    await this.page.goto(TasksPage.PATH);
    await this.waitForPageLoad();
  }

  /** Type text in the search box (client-side input that is never saved). */
  async fillSearch(text: string): Promise<void> {
    await this.fill(SEARCH_INPUT, text);
  }

  /** Current value of the search box. */
  async getSearchValue(): Promise<string> {
    const searchBox = await this.waitForElement(SEARCH_INPUT);
    return await searchBox.inputValue();
  }
}
