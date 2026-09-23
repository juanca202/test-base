import { BasePage } from './BasePage';

const HEADING = 'role=heading[name="Mis tareas"]';

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
}
