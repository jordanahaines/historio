# Setting Up Linting

1. `npm init @eslint/config`
2. ...
3. Import `next` config using flat util
4. Had to update most of the eslint plugins that came with nextjs because they weren't compaitble with the version of typescript I had installed or weren't compatible w/each other once I started upgrading:
   `npm i eslint@latest eslint-config-next@latest eslint-plugin-react-hooks@latest @typescript-eslint/parser@latest @typescript-eslint/eslint-plugin@latest --save

## Outstanding Issues

- Look into [scoped inting to use different configs for my two directories](https://github.com/vercel/style-guide/tree/canary?tab=readme-ov-file#scoped-configuration-with-overrides)
- eslintignore is being...ignored. How can I get that in use again or does it matter if I lint directories separately
