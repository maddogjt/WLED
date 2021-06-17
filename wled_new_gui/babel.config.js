module.exports = function (api) {
  const isEnvProduction = api.env("production");
  return {
    parserOpts: { strictMode: true },
    presets: [
      [
        '@babel/preset-env',
        {
          bugfixes: true,
          modules: /*options.modules ||*/ false,
          // targets: {
          //   browsers: options.browsers,
          // },
          targets: {
            browsers: ['last 1 Chrome version'],
          },
          exclude: ['transform-regenerator', 'transform-async-to-generator'],
        },
      ],
      '@babel/preset-typescript'
    ],
    plugins: [
      !isEnvProduction && '@prefresh/babel-plugin',
      // '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-object-assign',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      isEnvProduction && 'babel-plugin-transform-react-remove-prop-types',
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: 'preact',
          // This would be for classic mode
          // pragma: "h", pragmaFrag: "Fragment",
        },
      ],
    ].filter(Boolean),
    // overrides: [
    //   // Transforms to apply only to first-party code:
    //   {
    //     exclude: '**/node_modules/**',
    //     presets: [
    //       [
    //         '@babel/preset-typescript',
    //         {
    //           // if needed for classic mode
    //           // jsxPragma: "h", jsxPragmaFrag: "Fragment",
    //           allowDeclareFields: true,
    //         },
    //       ],
    //     ],
    //   },
    // ],
  };
};
