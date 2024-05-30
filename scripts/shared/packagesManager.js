'use strict';

exports.packagesManager = {
  getPublicPackages() {
    return [
      {
        getDirectoryName: () => "lexical-builder",
        getNpmName: () => "@etrepum/lexical-builder",
      },
    ];
  },
};
