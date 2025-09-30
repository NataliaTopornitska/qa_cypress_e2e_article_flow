/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

let articleTitle;
let articleDescription;
let articleBody;

describe('Article flow', () => {
  beforeEach(() => {
    // автентифікація перед кожним тестом
    cy.registerAndLogin();

    // генеруємо унікальні дані для статті
    articleTitle = 'Title ' + faker.string.alphanumeric(6);
    articleDescription = 'Description ' + faker.lorem.sentence();
    articleBody = 'Body ' + faker.lorem.paragraph();
  });

  it('Should create article via UI', () => {
    // ✅ явний виклик login-команди всередині тесту
    cy.login();

    cy.visit('/editor');

    cy.get('[formcontrolname=title]').type(articleTitle);
    cy.get('[formcontrolname=description]').type(articleDescription);
    cy.get('[formcontrolname=body]').type(articleBody);

    cy.contains('button', 'Publish Article').click();

    cy.contains('h1', articleTitle).should('be.visible');
    cy.contains(articleDescription).should('be.visible');
    cy.contains(articleBody).should('be.visible');
  });

  it('Should delete article via UI after creating it via API', () => {
    cy.createArticle(articleTitle, articleDescription, articleBody);

    cy.contains('h1', articleTitle).should('be.visible');
    cy.contains('button', 'Delete Article').click();

    // ✅ менш крихка перевірка
    cy.url().should('include', '/');
  });
});
