module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  // Temporary workaround for
  // https://github.com/storybookjs/storybook/issues/21642
  typescript: {
    reactDocgen: 'react-docgen-typescript-plugin',
  },
}
