module.exports = {
  "*.(js|cjs|svelte|mjs|jsx|css|html|md|ts|tsx|yml|json)": ["prettier --write"],
  "*.(js|cjs|svelte|mjs|jsx|ts|tsx)": ["eslint --fix"],
};
