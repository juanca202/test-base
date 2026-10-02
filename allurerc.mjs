import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Reporte de pruebas QA',
  output: './allure-report',
  historyPath: './.allure/history.jsonl',
  appendHistory: true,
  plugins: {
    awesome: {
      options: {
        reportName: 'Reporte de pruebas QA',
        singleFile: false,
        reportLanguage: 'es',
      },
    },
  },
});
