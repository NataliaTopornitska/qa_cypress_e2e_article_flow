import { faker } from '@faker-js/faker';

const imgUrl = 'https://static.productionready.io/images/smiley-cyrus.jpg';

Cypress.Commands.add('registerAndLogin', () => {
  const email = faker.internet.email();
  const username = 'user_' + faker.string.alphanumeric(6);
  const password = faker.internet.password();

  return cy
    .request({
      method: 'POST',
      url: '/api/users',
      failOnStatusCode: false, // ✅ тепер правильне місце
      body: {
        user: { email, username, password },
      },
    })
    .then((response) => {
      // ✅ приймаємо будь-який 2xx статус
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `❌ Користувача створити не вдалося: ${JSON.stringify(
            response.body.errors
          )}`
        );
      }

      const user = {
        bio: response.body.user.bio,
        effectiveImage: imgUrl,
        email: response.body.user.email,
        image: response.body.user.image,
        token: response.body.user.token,
        username: response.body.user.username,
      };

      return cy
        .window()
        .then((win) => {
          win.localStorage.setItem('user', JSON.stringify(user));
        })
        .then(() => {
          return cy.setCookie('auth', response.body.user.token);
        })
        .then(() => {
          return cy.wrap({ email, username, password });
        });
    });
});

// ✅ alias для відповідності вимогам завдання
Cypress.Commands.add('login', () => cy.registerAndLogin());

Cypress.Commands.add('createArticle', (title, description, body) => {
  return cy.window().then((win) => {
    const storedUser = JSON.parse(win.localStorage.getItem('user'));
    const token = storedUser?.token;

    if (!token) {
      throw new Error(
        '❌ Token not found in localStorage. Did you forget to call registerAndLogin()?'
      );
    }

    return cy
      .request({
        method: 'POST',
        url: '/api/articles',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: {
          article: {
            title,
            description,
            body,
            tagList: [],
            image: imgUrl,
          },
        },
      })
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(
            `❌ Статтю створити не вдалося: ${JSON.stringify(
              response.body.errors
            )}`
          );
        }

        cy.visit(`/article/${response.body.article.slug}`);
        return response.body.article;
      });
  });
});
