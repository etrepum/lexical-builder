module.exports = {
  "*.(js|mjs|jsx|css|html|md|ts|tsx|yml|json)": "prettier --write",
  "*.(js|mjs|jsx|ts|tsx)": ["eslint --fix"],
};
