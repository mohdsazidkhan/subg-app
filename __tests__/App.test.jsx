/**
 * @format
 */

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const App = require('../App').default;

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
